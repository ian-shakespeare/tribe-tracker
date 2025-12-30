import { useCallback, useState } from "react";
import PlatformMap from "../components/PlatformMap";
import { Family, MemberLocation } from "../lib/models";
import { toTitleCase } from "../lib/strings";
import { useFocusEffect } from "@react-navigation/native";
import { createLocation, getFamily, getUserLocations } from "../lib";
import { useToast } from "../contexts/Toast";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { SELECTED_FAMILY_KEY } from "../lib/constants";
import { StyleSheet } from "react-native";
import {
  Divider,
  Layout,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import RefreshIcon from "../components/RefreshIcon";
import { Coordinates } from "expo-maps";

export default function MapScreen() {
  const theme = useTheme();
  const toast = useToast();
  const [myCoords, setMyCoords] = useState<Coordinates | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [locations, setLocations] = useState<MemberLocation[]>([]);

  useFocusEffect(
    useCallback(() => {
      Location.requestForegroundPermissionsAsync()
        .then(({ granted }) => {
          if (!granted) throw new Error("Location permissions required.");

          return Location.getCurrentPositionAsync({
            accuracy: Location.LocationAccuracy.Lowest,
          });
        })
        .then(({ coords }) => {
          setMyCoords(coords);
          return createLocation(coords.latitude, coords.longitude);
        })
        .catch((e: Error) => toast.danger(e.message));

      const familyId = SecureStore.getItem(SELECTED_FAMILY_KEY);
      if (!familyId) return;

      getFamily(familyId).then(setFamily);

      getUserLocations(familyId)
        .then(setLocations)
        .catch((e: Error) => toast.danger(e.message));
    }, []),
  );

  const handleRefresh = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Lowest,
      });
      await createLocation(coords.latitude, coords.longitude);

      if (!family) return;
      setLocations(await getUserLocations(family.id));
    } catch (e) {
      if (e instanceof Error) {
        toast.danger(e.message);
      }
    }
  };

  const renderMenuActions = useCallback(
    () => <TopNavigationAction icon={RefreshIcon} onPress={handleRefresh} />,
    [],
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation
        title={family?.name ?? "No Select Family"}
        alignment="center"
        accessoryRight={renderMenuActions}
      />
      <Divider />
      <Layout style={styles.layout}>
        <PlatformMap
          cameraPosition={!myCoords ? undefined : { coordinates: myCoords }}
          markers={locations.map(({ firstName, lastName, coordinates }) => ({
            title: toTitleCase(`${firstName} ${lastName}`),
            coordinates: {
              latitude: coordinates.lat,
              longitude: coordinates.lon,
            },
          }))}
        />
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  layout: {
    flex: 1,
  },
  actionContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1,
    flexDirection: "row",
    gap: 6,
  },
  select: {
    flex: 1,
  },
});
