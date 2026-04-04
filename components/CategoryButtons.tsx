import { View, Text } from "react-native";

const categories = [
  { label: "My Classes", icon: "📚" },
  { label: "My Clubs", icon: "🚩" },
  { label: "My Events", icon: "📆" },
  { label: "Study Groups", icon: "👥" },
];

export function CategoryButtons() {
  return (
    <View className="mt-8 grid grid-cols-4 gap-4">
      {categories.map((item) => (
        <View key={item.label} className="items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-50">
            <Text className="text-xl" accessible={false}>{item.icon}</Text>
          </View>
          <Text className="mt-2 text-center text-sm font-medium text-gray-800">{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
