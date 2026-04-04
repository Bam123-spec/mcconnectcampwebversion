import { View, Text, Pressable } from "react-native";

const classes = [
  {
    id: "cs101",
    code: "CS101",
    title: "Introduction to Computer Science",
    subtitle: "Science Hall, Room 304",
    time: "10:00 AM – 11:30 AM",
  },
  {
    id: "math202",
    code: "MATH202",
    title: "Linear Algebra",
    subtitle: "Engineering Bldg, Room 102",
    time: "1:00 PM – 2:30 PM",
  },
];

export function TodayClasses() {
  return (
    <View className="mt-10">
      <Text className="text-lg font-semibold text-gray-900">Your Classes Today</Text>
      <View className="mt-4 gap-4">
        {classes.map((item) => (
          <View key={item.id} className="rounded-2xl bg-white p-4 shadow-sm shadow-black/10">
            <View className="self-start rounded-full bg-purple-50 px-3 py-1">
              <Text className="text-xs font-semibold text-purple-700">{item.code}</Text>
            </View>
            <Text className="mt-3 text-lg font-bold text-gray-900">{item.title}</Text>
            <Text className="mt-1 text-sm text-gray-600">{item.subtitle}</Text>
            <Text className="mt-2 text-sm font-semibold text-gray-800">{item.time}</Text>
            <View className="mt-4 flex-row gap-3">
              <Pressable className="flex-1 items-center justify-center rounded-xl bg-purple-600 px-4 py-3">
                <Text className="text-sm font-semibold text-white">Join Study Group</Text>
              </Pressable>
              <Pressable className="flex-1 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <Text className="text-sm font-semibold text-gray-800">Find Classmates</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
