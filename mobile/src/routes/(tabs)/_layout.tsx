import { BottomNavigation, BottomNavigationTab } from "@ui-kitten/components";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import GlobeIcon from "../../views/components/GlobeIcon";
import ImageIcon from "../../views/components/ImageIcon";
import PeopleIcon from "../../views/components/PeopleIcon";
import PersonIcon from "../../views/components/PersonIcon";

function BottomTabBar({ navigation, state, insets }: BottomTabBarProps) {
  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
      style={{ paddingBottom: insets.bottom }}
    >
      <BottomNavigationTab title="Map" icon={GlobeIcon} />
      <BottomNavigationTab title="Posts" icon={ImageIcon} />
      <BottomNavigationTab title="Families" icon={PeopleIcon} />
      <BottomNavigationTab title="Profile" icon={PersonIcon} />
    </BottomNavigation>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={BottomTabBar}>
      <Tabs.Screen name="map" />
      <Tabs.Screen name="postlist" />
      <Tabs.Screen name="familylist" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
