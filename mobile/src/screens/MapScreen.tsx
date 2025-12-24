import { useCallback, useEffect, useState } from "react";
import PlatformMap from "../components/PlatformMap";
import { Family, MemberLocation } from "../lib/models";
import { toTitleCase } from "../lib/strings";
import { useFocusEffect } from "@react-navigation/native";
import { createLocation, getFamilies, getUserLocations } from "../lib";
import { useToast } from "../contexts/Toast";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { SELECTED_FAMILY_KEY } from "../lib/constants";
import { StyleSheet, View } from "react-native";
import { Button, IndexPath, Select, SelectItem } from "@ui-kitten/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RefreshIcon from "../components/RefreshIcon";

export default function MapScreen() {
  const toast = useToast();
  const { top } = useSafeAreaInsets();
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<IndexPath | IndexPath[]>(
    new IndexPath(-1),
  );
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
        .then(({ coords }) => createLocation(coords.latitude, coords.longitude))
        .catch((e: Error) => toast.danger(e.message));

      getFamilies()
        .then((f) => {
          setFamilies(f);

          const initialFamily = SecureStore.getItem(SELECTED_FAMILY_KEY) ?? "";
          const index = f.findIndex(({ id }) => id === initialFamily);
          if (index === -1) {
            SecureStore.setItem(SELECTED_FAMILY_KEY, "");
            return;
          }

          setSelectedIndex(new IndexPath(index));
        })
        .catch((e: Error) => toast.danger(e.message));
    }, []),
  );

  useEffect(() => {
    const family = families.at((selectedIndex as IndexPath).row);
    if (!family) return;

    getUserLocations(family.id)
      .then(setLocations)
      .catch((e: Error) => toast.danger(e.message));
  }, [selectedIndex]);

  const handleRefresh = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Lowest,
      });
      await createLocation(coords.latitude, coords.longitude);

      const family = families.at((selectedIndex as IndexPath).row);
      if (!family) return;

      setLocations(await getUserLocations(family.id));
    } catch (e) {
      if (e instanceof Error) {
        toast.danger(e.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {families.length >= 1 && (
        <View
          style={[
            styles.selectContainer,
            {
              top: top + 12,
            },
          ]}
        >
          <Select
            value={families.at((selectedIndex as IndexPath).row)?.name ?? ""}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            style={styles.select}
          >
            {families.map(({ name }) => (
              <SelectItem title={name} />
            ))}
          </Select>
          <Button
            size="tiny"
            accessoryRight={RefreshIcon}
            onPress={handleRefresh}
          ></Button>
        </View>
      )}
      <PlatformMap
        markers={locations.map(({ firstName, lastName, coordinates }) => ({
          title: toTitleCase(`${firstName} ${lastName}`),
          coordinates,
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  selectContainer: {
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
