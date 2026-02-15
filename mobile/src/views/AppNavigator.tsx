import { BottomNavigation, BottomNavigationTab } from "@ui-kitten/components";
import MapScreen from "./screens/MapScreen";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "./screens/SignInScreen";
import FamilyNewScreen from "./screens/FamilyNewScreen";
import FamilyListScreen from "./screens/FamilyListScreen";
import FamilyDetailScreen from "./screens/FamilyDetailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PeopleIcon from "./components/PeopleIcon";
import PersonIcon from "./components/PersonIcon";
import PostListScreen from "./screens/PostListScreen";
import ImageIcon from "./components/ImageIcon";
import GlobeIcon from "./components/GlobeIcon";
import ProfileEditScreen from "./screens/ProfileEditScreen";
import SettingsScreen from "./screens/SettingsScreen";

export type StackParamList = {
  map: undefined;
  familylist: undefined;
  signin: undefined;
  familynew: undefined;
  familydetail: { familyId: string };
  tabs: undefined;
  profile: undefined;
  postlist: undefined;
  profileedit: undefined;
  settings: undefined;
};

const Tab = createBottomTabNavigator<StackParamList>();
const Stack = createNativeStackNavigator<StackParamList>();

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

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={BottomTabBar}>
      <Tab.Screen name="map" component={MapScreen} />
      <Tab.Screen name="postlist" component={PostListScreen} />
      <Tab.Screen name="familylist" component={FamilyListScreen} />
      <Tab.Screen name="profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" component={SignInScreen} />
      <Stack.Screen name="familynew" component={FamilyNewScreen} />
      <Stack.Screen name="familydetail" component={FamilyDetailScreen} />
      <Stack.Screen name="profileedit" component={ProfileEditScreen} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
