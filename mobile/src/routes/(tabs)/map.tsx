import PlatformMap from "../../views/components/PlatformMap";
import { useLiveQuery } from "../../db/liveQuery";
import { getUserLocations } from "../../models/user";
import { toTitleCase } from "../../utils/strings";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { useState } from "react";
import UserHighlight from "../../views/components/UserHighlight";
import Animated, { FadeOut, SlideInUp } from "react-native-reanimated";

export default function MapScreen() {
  const { top } = useSafeAreaInsets();
  const query = useLiveQuery(getUserLocations);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const selectedLocation = query.isLoading
    ? null
    : (query.result.find(({ id }) => id === selectedLocationId) ?? null);

  return (
    <>
      {selectedLocation && (
        <Animated.View
          entering={SlideInUp}
          exiting={FadeOut}
          style={[
            styles.highlightContainer,
            {
              top,
            },
          ]}
        >
          <UserHighlight
            userLocation={selectedLocation}
            onPress={() => setSelectedLocationId(null)}
          />
        </Animated.View>
      )}
      <PlatformMap
        onMarkerClick={setSelectedLocationId}
        onMapClick={() => setSelectedLocationId(null)}
        markers={
          query.isLoading
            ? []
            : query.result.map(({ id, firstName, lastName, lat, lon }) => ({
                id: id,
                title: toTitleCase(`${firstName} ${lastName}`),
                coordinates: {
                  latitude: lat,
                  longitude: lon,
                },
              }))
        }
        cameraPosition={
          query.isLoading || query.result.length < 1
            ? undefined
            : {
                coordinates: {
                  latitude: query.result[0].lat,
                  longitude: query.result[0].lon,
                },
                zoom: 7,
              }
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  highlightContainer: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    paddingHorizontal: 12,
  },
});
