import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  IconElement,
  IconProps,
} from "@ui-kitten/components";
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

export type StackParamList = {
  map: undefined;
  familylist: undefined;
  signin: undefined;
  familynew: undefined;
  familydetail: { familyId: string };
  tabs: undefined;
};

const Tab = createBottomTabNavigator<StackParamList>();
const Stack = createNativeStackNavigator<StackParamList>();

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
      <Tab.Screen name="familylist" component={FamilyListScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" component={SignInScreen} />
      <Stack.Screen name="familynew" component={FamilyNewScreen} />
      <Stack.Screen name="familydetail" component={FamilyDetailScreen} />
      <Stack.Screen name="tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
