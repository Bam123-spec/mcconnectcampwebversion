import { Text, View } from "react-native";

const events = [
  {
    id: "soon",
    tag: "STARTING SOON",
    tagColor: "bg-pink-100 text-pink-700",
    title: "Tech Talk: AI Futures",
    subtitle: "Starting in 15m",
  },
  {
    id: "active",
    tag: "ACTIVE NOW",
    tagColor: "bg-green-100 text-green-700",
    title: "Calculus II Group",
    subtitle: "5 students active",
  },
];

export function CampusNow() {
  return (
    <View className="mt-10">
      <Text className="text-lg font-semibold text-gray-900">Campus Now</Text>
      <View className="mt-4 flex-row gap-4">
        {events.map((item) => (
          <View key={item.id} className="flex-1 rounded-2xl bg-white p-4 shadow-sm shadow-black/10">
            <View className={`self-start rounded-full px-3 py-1 ${item.tagColor}`}>
              <Text className="text-xs font-semibold text-inherit">{item.tag}</Text>
            </View>
            <Text className="mt-3 text-lg font-bold text-gray-900">{item.title}</Text>
            <Text className="mt-2 text-sm text-gray-600">{item.subtitle}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
