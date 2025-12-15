import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  IconElement,
  IconProps,
} from "@ui-kitten/components";
import MapScreen from "./screens/MapScreen";
import FamiliesScreen from "./screens/FamiliesScreen";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "./screens/SignInScreen";
import NewFamilyScreen from "./screens/NewFamilyScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MapIcon(props: IconProps): IconElement {
  return <Icon {...props} name="map-outline" />;
}

function FamilyIcon(props: IconProps): IconElement {
  return <Icon {...props} name="people-outline" />;
}

function BottomTabBar({ navigation, state }: BottomTabBarProps) {
  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      <BottomNavigationTab title="MAP" icon={MapIcon} />
      <BottomNavigationTab title="FAMILIES" icon={FamilyIcon} />
    </BottomNavigation>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={BottomTabBar}>
      <Tab.Screen name="map" component={MapScreen} />
      <Tab.Screen name="families" component={FamiliesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" component={SignInScreen} />
      <Stack.Screen name="newfamily" component={NewFamilyScreen} />
      <Stack.Screen name="tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
