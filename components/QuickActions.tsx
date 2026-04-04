import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const actions = [
  {
    id: "classes",
    label: "My Classes",
    icon: "book-outline",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "clubs",
    label: "My Clubs",
    icon: "people-outline",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: "events",
    label: "My Events",
    icon: "calendar-outline",
    color: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    id: "groups",
    label: "Study Groups",
    icon: "library-outline",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

export function QuickActions() {
  return (
    <View className="mt-6 flex-row justify-between px-2">
      {actions.map((action) => (
        <Pressable key={action.id} className="items-center gap-2">
          <View className={`h-14 w-14 items-center justify-center rounded-2xl ${action.color} shadow-sm shadow-black/5`}>
            <Ionicons name={action.icon as any} size={24} className={action.iconColor} />
          </View>
          <Text className="text-xs font-medium text-gray-700">{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
