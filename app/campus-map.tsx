import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Polyline } from "react-native-svg";
import { useTheme } from "@/context/ThemeContext";
import {
  CampusCategory,
  CampusLocation,
  campusCategoryOrder,
  getCampusLocationLabel,
  tpssCampusLocations,
  tpssCampusRouteEdges,
  tpssCampusRouteNodes,
  tpssLocationById,
  tpssRouteNodeById,
} from "@/lib/campus/tpssCampusData";

const campusMapImage = require("../assets/images/tpss-campus-map.png");

const categoryTint: Record<CampusCategory, { bg: string; text: string; dot: string }> = {
  Services: { bg: "#E0F2FE", text: "#075985", dot: "#0EA5E9" },
  Academic: { bg: "#F3E8FF", text: "#6B21A8", dot: "#A855F7" },
  Parking: { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  "Campus Hub": { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
};

const FROM_COLOR = "#10B981";
const TO_COLOR = "#8B5CF6";
const ROUTE_COLOR = "#F97316";

const normalize = (value: string) => value.toLowerCase().trim();

const distanceBetweenNodes = (fromId: string, toId: string) => {
  const from = tpssRouteNodeById.get(fromId);
  const to = tpssRouteNodeById.get(toId);

  if (!from || !to) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.hypot(to.x - from.x, to.y - from.y);
};

const buildAdjacencyMap = () => {
  const adjacency = new Map<string, Array<{ to: string; label?: string; weight: number }>>();

  for (const edge of tpssCampusRouteEdges) {
    const weight = distanceBetweenNodes(edge.from, edge.to);

    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);

    adjacency.get(edge.from)!.push({ to: edge.to, label: edge.label, weight });
    adjacency.get(edge.to)!.push({ to: edge.from, label: edge.label, weight });
  }

  return adjacency;
};

const routeAdjacency = buildAdjacencyMap();

const getShortestPath = (fromLocationId: string, toLocationId: string) => {
  const startLocation = tpssLocationById.get(fromLocationId);
  const endLocation = tpssLocationById.get(toLocationId);

  if (!startLocation || !endLocation) {
    return [] as string[];
  }

  if (startLocation.routeNodeId === endLocation.routeNodeId) {
    return [startLocation.routeNodeId];
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of tpssCampusRouteNodes) {
    distances.set(node.id, Number.POSITIVE_INFINITY);
    previous.set(node.id, null);
  }

  distances.set(startLocation.routeNodeId, 0);

  while (visited.size < tpssCampusRouteNodes.length) {
    let currentNodeId: string | null = null;
    let currentDistance = Number.POSITIVE_INFINITY;

    for (const [nodeId, distance] of distances.entries()) {
      if (!visited.has(nodeId) && distance < currentDistance) {
        currentNodeId = nodeId;
        currentDistance = distance;
      }
    }

    if (!currentNodeId || currentDistance === Number.POSITIVE_INFINITY) {
      break;
    }

    if (currentNodeId === endLocation.routeNodeId) {
      break;
    }

    visited.add(currentNodeId);

    for (const neighbor of routeAdjacency.get(currentNodeId) || []) {
      if (visited.has(neighbor.to)) {
        continue;
      }

      const candidateDistance = currentDistance + neighbor.weight;
      if (candidateDistance < (distances.get(neighbor.to) || Number.POSITIVE_INFINITY)) {
        distances.set(neighbor.to, candidateDistance);
        previous.set(neighbor.to, currentNodeId);
      }
    }
  }

  const path: string[] = [];
  let current: string | null = endLocation.routeNodeId;

  while (current) {
    path.unshift(current);
    current = previous.get(current) || null;
  }

  if (path[0] !== startLocation.routeNodeId) {
    return [startLocation.routeNodeId, endLocation.routeNodeId];
  }

  return path;
};

const getRouteDistance = (path: string[]) => {
  let total = 0;

  for (let index = 0; index < path.length - 1; index += 1) {
    total += distanceBetweenNodes(path[index], path[index + 1]);
  }

  return total;
};

const getRouteMinutes = (path: string[]) => {
  const percentDistance = getRouteDistance(path);
  const estimatedMeters = percentDistance * 8;
  return Math.max(1, Math.round(estimatedMeters / 80));
};

const getRouteSteps = (fromLocation: CampusLocation, toLocation: CampusLocation, path: string[]) => {
  const edgeLabels: string[] = [];

  for (let index = 0; index < path.length - 1; index += 1) {
    const current = path[index];
    const next = path[index + 1];
    const edge = tpssCampusRouteEdges.find(
      (candidate) =>
        (candidate.from === current && candidate.to === next) ||
        (candidate.from === next && candidate.to === current)
    );

    if (edge?.label && edgeLabels[edgeLabels.length - 1] !== edge.label) {
      edgeLabels.push(edge.label);
    }
  }

  const steps = [`Start at ${getCampusLocationLabel(fromLocation.id)}.`];

  for (const label of edgeLabels) {
    if (label === "pedestrian bridge") {
      steps.push("Cross the pedestrian bridge toward Raptor Central.");
      continue;
    }

    if (label === "central services walk") {
      steps.push("Continue through the central services corridor.");
      continue;
    }

    if (label === "east campus walk") {
      steps.push("Follow the east campus path toward the pavilion cluster.");
      continue;
    }

    if (label === "south campus walk") {
      steps.push("Stay on the south campus spine toward the larger academic buildings.");
      continue;
    }

    if (label === "north campus walk") {
      steps.push("Use the north campus walk to stay on the upper side of the map.");
      continue;
    }

    steps.push(`Follow the ${label}.`);
  }

  steps.push(`Arrive at ${getCampusLocationLabel(toLocation.id)}.`);
  return steps;
};

const getLocationCenter = (location: CampusLocation) => ({
  x: location.x + location.width / 2,
  y: location.y + location.height / 2,
});

type SelectionMode = "from" | "to";

export default function CampusMapScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { darkMode, theme: currentTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CampusCategory | "All">("All");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("to");
  const [fromLocationId, setFromLocationId] = useState("p3");
  const [toLocationId, setToLocationId] = useState("st");
  const [focusedLocationId, setFocusedLocationId] = useState("st");

  const mapWidth = Math.min(width - 32, 420);
  const mapHeight = mapWidth * (2200 / 1698);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = normalize(query);

    return tpssCampusLocations.filter((location) => {
      const matchesCategory =
        selectedCategory === "All" || location.category === selectedCategory;

      if (!normalizedQuery) {
        return matchesCategory;
      }

      const haystack = [location.code, location.name, location.description, ...location.details]
        .join(" ")
        .toLowerCase();

      return matchesCategory && haystack.includes(normalizedQuery);
    });
  }, [query, selectedCategory]);

  const fromLocation = tpssLocationById.get(fromLocationId) || tpssCampusLocations[0];
  const toLocation = tpssLocationById.get(toLocationId) || tpssCampusLocations[0];
  const focusedLocation =
    tpssLocationById.get(focusedLocationId) ||
    tpssLocationById.get(toLocationId) ||
    tpssCampusLocations[0];

  const routeNodePath = useMemo(
    () => getShortestPath(fromLocation.id, toLocation.id),
    [fromLocation.id, toLocation.id]
  );

  const routePoints = useMemo(() => {
    const points = routeNodePath
      .map((nodeId) => tpssRouteNodeById.get(nodeId))
      .filter(Boolean)
      .map((node) => `${((node!.x / 100) * mapWidth).toFixed(1)},${((node!.y / 100) * mapHeight).toFixed(1)}`);

    return points.join(" ");
  }, [mapHeight, mapWidth, routeNodePath]);

  const routeMinutes = useMemo(() => getRouteMinutes(routeNodePath), [routeNodePath]);
  const routeSteps = useMemo(
    () => getRouteSteps(fromLocation, toLocation, routeNodePath),
    [fromLocation, toLocation, routeNodePath]
  );

  const groupedLocations = useMemo(
    () =>
      campusCategoryOrder
        .map((category) => ({
          category,
          locations: filteredLocations.filter((location) => location.category === category),
        }))
        .filter((group) => group.locations.length > 0),
    [filteredLocations]
  );

  const assignLocation = (locationId: string) => {
    if (selectionMode === "from") {
      setFromLocationId(locationId);
      setFocusedLocationId(locationId);
      setSelectionMode("to");
      return;
    }

    setToLocationId(locationId);
    setFocusedLocationId(locationId);
  };

  const swapRoute = () => {
    setFromLocationId(toLocationId);
    setToLocationId(fromLocationId);
    setFocusedLocationId(fromLocationId);
  };

  return (
    <SafeAreaView style={{ backgroundColor: currentTheme.bg }} className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: currentTheme.surface,
            borderBottomColor: currentTheme.border,
            borderBottomWidth: 1,
          }}
          className="px-4 pt-2 pb-5"
        >
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: darkMode ? "#1E293B" : "#F3F4F6" }}
            >
              <Ionicons name="arrow-back" size={22} color={currentTheme.text} />
            </Pressable>

            <View className="flex-1 px-3">
              <Text
                style={{ color: currentTheme.textLight }}
                className="text-[12px] font-medium uppercase tracking-[1.4px]"
              >
                Campus Wayfinding
              </Text>
              <Text style={{ color: currentTheme.text }} className="text-[24px] font-bold">
                TPSS Navigator
              </Text>
            </View>
          </View>

          <Text style={{ color: currentTheme.textLight }} className="mt-3 text-[14px] leading-6">
            Search a destination like ST, set where you are now, and the app will trace the best campus route.
          </Text>

          <View
            style={{
              backgroundColor: darkMode ? "#111827" : "#F8FAFC",
              borderColor: currentTheme.border,
              borderWidth: 1,
            }}
            className="mt-4 flex-row items-center rounded-[18px] px-4 py-3"
          >
            <Ionicons name="search-outline" size={18} color={currentTheme.textLight} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by code, building, or service"
              placeholderTextColor={currentTheme.textLight}
              className="ml-3 flex-1 text-[15px]"
              style={{ color: currentTheme.text }}
              accessibilityLabel="Search campus locations"
            />
          </View>

          <View className="mt-4 flex-row items-center gap-3">
            <Pressable
              onPress={() => setSelectionMode("from")}
              accessibilityRole="button"
              accessibilityLabel="Set current location"
              className="flex-1 rounded-[22px] px-4 py-3"
              style={{
                backgroundColor: selectionMode === "from" ? "#ECFDF5" : currentTheme.surface,
                borderWidth: 1,
                borderColor: selectionMode === "from" ? FROM_COLOR : currentTheme.border,
              }}
            >
              <Text className="text-[11px] font-semibold uppercase tracking-[1.2px]" style={{ color: FROM_COLOR }}>
                From
              </Text>
              <Text style={{ color: currentTheme.text }} className="mt-1 text-[15px] font-semibold">
                {getCampusLocationLabel(fromLocation.id)}
              </Text>
            </Pressable>

            <Pressable
              onPress={swapRoute}
              accessibilityRole="button"
              accessibilityLabel="Swap start and destination"
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: darkMode ? "#111827" : "#F3F4F6" }}
            >
              <Ionicons name="swap-vertical" size={20} color={currentTheme.text} />
            </Pressable>

            <Pressable
              onPress={() => setSelectionMode("to")}
              accessibilityRole="button"
              accessibilityLabel="Set destination"
              className="flex-1 rounded-[22px] px-4 py-3"
              style={{
                backgroundColor: selectionMode === "to" ? "#F5F3FF" : currentTheme.surface,
                borderWidth: 1,
                borderColor: selectionMode === "to" ? TO_COLOR : currentTheme.border,
              }}
            >
              <Text className="text-[11px] font-semibold uppercase tracking-[1.2px]" style={{ color: TO_COLOR }}>
                To
              </Text>
              <Text style={{ color: currentTheme.text }} className="mt-1 text-[15px] font-semibold">
                {getCampusLocationLabel(toLocation.id)}
              </Text>
            </Pressable>
          </View>

          <View className="mt-4 flex-row items-center gap-2">
            <View className="rounded-full px-3 py-2" style={{ backgroundColor: darkMode ? "#111827" : "#FFF7ED" }}>
              <Text style={{ color: ROUTE_COLOR }} className="text-[12px] font-semibold">
                {routeMinutes} min walk
              </Text>
            </View>
            <Text style={{ color: currentTheme.textLight }} className="text-[13px]">
              Selecting {selectionMode === "from" ? "current location" : "destination"} now
            </Text>
          </View>
        </View>

        <View className="px-4 pt-5">
          <View
            style={{
              backgroundColor: currentTheme.surface,
              borderColor: currentTheme.border,
              borderWidth: 1,
            }}
            className="overflow-hidden rounded-[28px]"
          >
            <View style={{ width: mapWidth, height: mapHeight }} className="self-center">
              <Image
                source={campusMapImage}
                style={{ width: mapWidth, height: mapHeight }}
                resizeMode="contain"
                accessibilityLabel="Takoma Park and Silver Spring campus map"
              />

              <Svg
                pointerEvents="none"
                width={mapWidth}
                height={mapHeight}
                style={{ position: "absolute", left: 0, top: 0 }}
              >
                {routePoints ? (
                  <Polyline
                    points={routePoints}
                    fill="none"
                    stroke={ROUTE_COLOR}
                    strokeWidth={5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ) : null}

                {routeNodePath.map((nodeId, index) => {
                  const node = tpssRouteNodeById.get(nodeId);
                  if (!node) return null;

                  const isStart = index === 0;
                  const isEnd = index === routeNodePath.length - 1;

                  return (
                    <Circle
                      key={nodeId}
                      cx={(node.x / 100) * mapWidth}
                      cy={(node.y / 100) * mapHeight}
                      r={isStart || isEnd ? 7 : 4}
                      fill={isStart ? FROM_COLOR : isEnd ? TO_COLOR : ROUTE_COLOR}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                })}
              </Svg>

              {tpssCampusLocations.map((location) => {
                const isFocused = focusedLocation.id === location.id;
                const isStart = fromLocation.id === location.id;
                const isDestination = toLocation.id === location.id;
                const isMatched = filteredLocations.some((candidate) => candidate.id === location.id);
                const tint = categoryTint[location.category];
                const center = getLocationCenter(location);

                return (
                  <Pressable
                    key={location.id}
                    onPress={() => assignLocation(location.id)}
                    onLongPress={() => setFocusedLocationId(location.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${location.code}, ${location.name}`}
                    accessibilityHint={`Sets this as ${selectionMode === "from" ? "your current location" : "your destination"}`}
                    style={{
                      position: "absolute",
                      left: `${location.x}%`,
                      top: `${location.y}%`,
                      width: `${location.width}%`,
                      height: `${location.height}%`,
                      borderWidth: isStart || isDestination || isFocused ? 2 : 1,
                      borderColor: isStart
                        ? FROM_COLOR
                        : isDestination
                          ? TO_COLOR
                          : isFocused
                            ? tint.dot
                            : "rgba(255,255,255,0.6)",
                      backgroundColor: isFocused
                        ? `${tint.dot}33`
                        : isMatched
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(255,255,255,0.02)",
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isMatched || isStart || isDestination ? 1 : 0.28,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: isStart
                          ? FROM_COLOR
                          : isDestination
                            ? TO_COLOR
                            : "rgba(17,24,39,0.82)",
                      }}
                      className="rounded-full px-2.5 py-1"
                    >
                      <Text className="text-[10px] font-bold text-white">{location.code}</Text>
                    </View>

                    {(isStart || isDestination) && (
                      <View
                        style={{
                          position: "absolute",
                          left: `${center.x - location.x}%`,
                          top: `${center.y - location.y}%`,
                        }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-4 rounded-[28px] p-5" style={{ backgroundColor: currentTheme.surface }}>
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-semibold uppercase tracking-[1.2px]">
                  Route Summary
                </Text>
                <Text style={{ color: currentTheme.text }} className="mt-2 text-[24px] font-bold leading-tight">
                  {fromLocation.code} to {toLocation.code}
                </Text>
                <Text style={{ color: currentTheme.textLight }} className="mt-1 text-[14px] leading-6">
                  Estimated {routeMinutes} minute walk across campus.
                </Text>
              </View>

              <View className="rounded-full px-3 py-2" style={{ backgroundColor: darkMode ? "#111827" : "#FFF7ED" }}>
                <Text style={{ color: ROUTE_COLOR }} className="text-[12px] font-semibold">
                  Wayfinding
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              {routeSteps.map((step, index) => (
                <View key={`${step}-${index}`} className="flex-row gap-3">
                  <View className="items-center">
                    <View
                      className="h-6 w-6 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          index === 0 ? FROM_COLOR : index === routeSteps.length - 1 ? TO_COLOR : ROUTE_COLOR,
                      }}
                    >
                      <Text className="text-[10px] font-bold text-white">{index + 1}</Text>
                    </View>
                    {index !== routeSteps.length - 1 && (
                      <View className="mt-1 h-8 w-[2px]" style={{ backgroundColor: currentTheme.border }} />
                    )}
                  </View>
                  <Text style={{ color: currentTheme.text }} className="flex-1 pt-0.5 text-[14px] leading-6">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-5 rounded-[28px] p-5" style={{ backgroundColor: currentTheme.surface }}>
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text style={{ color: currentTheme.text }} className="text-[18px] font-bold">
                  Location Focus
                </Text>
                <Text style={{ color: currentTheme.textLight }} className="mt-1 text-[13px] leading-5">
                  Tap any hotspot or result to inspect it. The active picker decides whether it becomes your start or destination.
                </Text>
              </View>

              <Pressable
                onPress={() => setQuery(focusedLocation.code)}
                accessibilityRole="button"
                accessibilityLabel={`Focus search on ${focusedLocation.code}`}
                className="rounded-full px-3 py-2"
                style={{ backgroundColor: darkMode ? "#111827" : "#F3F4F6" }}
              >
                <Ionicons name="locate-outline" size={18} color={currentTheme.text} />
              </Pressable>
            </View>

            <View className="mt-4">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: categoryTint[focusedLocation.category].dot }}
                />
                <Text style={{ color: categoryTint[focusedLocation.category].text }} className="text-[12px] font-semibold uppercase tracking-[1.3px]">
                  {focusedLocation.category}
                </Text>
              </View>
              <Text style={{ color: currentTheme.text }} className="mt-2 text-[24px] font-bold leading-tight">
                {focusedLocation.code}
              </Text>
              <Text style={{ color: currentTheme.text }} className="text-[18px] font-semibold leading-7">
                {focusedLocation.name}
              </Text>
              <Text style={{ color: currentTheme.textLight }} className="mt-3 text-[14px] leading-6">
                {focusedLocation.description}
              </Text>

              <View className="mt-4 flex-row flex-wrap gap-2">
                {focusedLocation.details.map((detail) => (
                  <View
                    key={detail}
                    className="rounded-full px-3 py-2"
                    style={{ backgroundColor: darkMode ? "#111827" : "#F8FAFC" }}
                  >
                    <Text style={{ color: currentTheme.text }} className="text-[12px] font-medium">
                      {detail}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="mt-5 rounded-[28px] p-5" style={{ backgroundColor: currentTheme.surface }}>
            <Text style={{ color: currentTheme.text }} className="text-[18px] font-bold">
              Assign Locations
            </Text>
            <Text style={{ color: currentTheme.textLight }} className="mt-1 text-[13px] leading-5">
              Search narrows this list. Selecting a row assigns it to the active route field.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{ gap: 10, paddingRight: 12 }}
            >
              {(["All", ...campusCategoryOrder] as const).map((category) => {
                const isActive = selectedCategory === category;
                const tint = category === "All" ? null : categoryTint[category];

                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter ${category}`}
                    className="rounded-full px-4 py-2.5"
                    style={{
                      backgroundColor: isActive
                        ? tint?.bg || currentTheme.primary
                        : darkMode
                          ? "#111827"
                          : "#FFFFFF",
                      borderWidth: 1,
                      borderColor: isActive ? tint?.dot || currentTheme.primary : currentTheme.border,
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? tint?.text || "#FFFFFF" : currentTheme.text,
                        fontWeight: "600",
                      }}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="mt-4 gap-4">
              {groupedLocations.map((group) => (
                <View key={group.category}>
                  <Text
                    style={{ color: currentTheme.textLight }}
                    className="mb-2 text-[11px] font-semibold uppercase tracking-[1.4px]"
                  >
                    {group.category}
                  </Text>

                  <View className="gap-2">
                    {group.locations.map((location) => {
                      const isStart = fromLocation.id === location.id;
                      const isDestination = toLocation.id === location.id;
                      const isFocused = focusedLocation.id === location.id;

                      return (
                        <Pressable
                          key={location.id}
                          onPress={() => assignLocation(location.id)}
                          onLongPress={() => setFocusedLocationId(location.id)}
                          accessibilityRole="button"
                          accessibilityLabel={`${location.code}, ${location.name}`}
                          accessibilityHint={`Sets this as ${selectionMode === "from" ? "your current location" : "your destination"}`}
                          className="rounded-[20px] px-4 py-3"
                          style={{
                            backgroundColor: isFocused
                              ? darkMode
                                ? "#111827"
                                : "#F8FAFC"
                              : "transparent",
                            borderWidth: 1,
                            borderColor: isStart
                              ? FROM_COLOR
                              : isDestination
                                ? TO_COLOR
                                : currentTheme.border,
                          }}
                        >
                          <View className="flex-row items-center justify-between gap-3">
                            <View className="flex-1">
                              <Text style={{ color: currentTheme.text }} className="text-[15px] font-semibold">
                                {location.code} · {location.name}
                              </Text>
                              <Text
                                style={{ color: currentTheme.textLight }}
                                className="mt-1 text-[12px] leading-5"
                              >
                                {location.description}
                              </Text>
                            </View>

                            <View className="items-end">
                              {isStart && (
                                <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: "#ECFDF5" }}>
                                  <Text style={{ color: FROM_COLOR }} className="text-[10px] font-semibold uppercase">
                                    From
                                  </Text>
                                </View>
                              )}
                              {isDestination && (
                                <View className="mt-1 rounded-full px-2.5 py-1" style={{ backgroundColor: "#F5F3FF" }}>
                                  <Text style={{ color: TO_COLOR }} className="text-[10px] font-semibold uppercase">
                                    To
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
