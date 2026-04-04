import { Text, View } from "react-native";

export function Header() {
  return (
    <View className="flex-row items-center justify-between">
      <View className="gap-1">
        <Text className="text-sm text-gray-500">Good Morning,</Text>
        <Text className="text-2xl font-bold text-gray-900">Beamlaky0👋</Text>
        <View className="mt-3 flex-row items-center gap-3">
          <View className="flex-row items-center gap-2 rounded-full bg-purple-50 px-3 py-2">
            <View className="h-2 w-2 rounded-full bg-purple-600" />
            <Text className="text-sm font-semibold text-purple-700">1,250 SP</Text>
          </View>
          <View className="flex-row items-center gap-2 rounded-full bg-blue-50 px-3 py-2">
            <Text className="text-base">⚡</Text>
            <Text className="text-sm font-semibold text-blue-700">Lvl 8</Text>
          </View>
        </View>
      </View>
      <View className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm shadow-black/10">
        <Text className="text-xl">🔔</Text>
      </View>
    </View>
  );
}
