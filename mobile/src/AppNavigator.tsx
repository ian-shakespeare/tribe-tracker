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
import FamilyInviteScreen from "./screens/FamilyInviteScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PeopleIcon from "./components/PeopleIcon";
import PersonIcon from "./components/PersonIcon";
import MapIcon from "./components/MapIcon";

export type StackParamList = {
  map: undefined;
  familylist: undefined;
  signin: undefined;
  familynew: undefined;
  familydetail: { familyId: string };
  familyinvite: { familyId: string };
  tabs: undefined;
  profile: undefined;
};

const Tab = createBottomTabNavigator<StackParamList>();
const Stack = createNativeStackNavigator<StackParamList>();

function BottomTabBar({ navigation, state }: BottomTabBarProps) {
  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
      style={{ paddingBottom: 12 }}
    >
      <BottomNavigationTab title="MAP" icon={MapIcon} />
      <BottomNavigationTab title="FAMILIES" icon={PeopleIcon} />
      <BottomNavigationTab title="PROFILE" icon={PersonIcon} />
    </BottomNavigation>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={BottomTabBar}>
      <Tab.Screen name="map" component={MapScreen} />
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
      <Stack.Screen name="familyinvite" component={FamilyInviteScreen} />
      <Stack.Screen name="tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
