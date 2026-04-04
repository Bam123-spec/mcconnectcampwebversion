import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      detachInactiveScreens
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        lazy: true,
      }}
      backBehavior="history"
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home" }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: "Events" }}
      />
      <Tabs.Screen
        name="community"
        options={{ title: "Community" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
      
      {/* Hidden Routes (Still accessible via UI routing but not in Tab Bar) */}
      <Tabs.Screen
        name="clubs"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="forum"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="chat"
        options={{ href: null }}
      />
    </Tabs>
  );
}
