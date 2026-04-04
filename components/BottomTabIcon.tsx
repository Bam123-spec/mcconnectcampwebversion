import { Text, View } from "react-native";

const ICONS: Record<string, string> = {
  home: "🏠",
  clubs: "🚩",
  chat: "💬",
  events: "📅",
  profile: "👤",
};

type Props = {
  name: string;
  focused: boolean;
  color: string;
};

export function BottomTabIcon({ name, focused, color }: Props) {
  const icon = ICONS[name] ?? "⬜";
  return (
    <View className="items-center justify-center gap-1">
      <Text style={{ color, fontSize: 18 }}>{icon}</Text>
      <View className={`h-1 w-5 rounded-full ${focused ? "bg-purple-600" : "bg-transparent"}`} />
    </View>
  );
}
