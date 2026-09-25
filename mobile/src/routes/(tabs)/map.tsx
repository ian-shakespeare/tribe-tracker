import PlatformMap from "../../views/components/PlatformMap";
import { useClusteredMarkers } from "../../views/components/useClusteredMarkers";
import { useLiveQuery } from "../../db/liveQuery";
import { getUserLocations } from "../../db/users";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { useState } from "react";
import LocationHighlight from "../../views/components/LocationHighlight";
import Animated, { FadeOut, SlideInUp } from "react-native-reanimated";
import type { UserLocation } from "../../models/user";

const DEFAULT_ZOOM = 7;

export default function MapScreen() {
  const { top } = useSafeAreaInsets();
  const query = useLiveQuery(getUserLocations);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [selectedUserLocations, setSelectedUserLocations] = useState<
    UserLocation[] | null
  >(null);

  const { markers, getUserLocationsInCluster } = useClusteredMarkers(
    query.isLoading ? [] : query.result,
    zoom,
  );

  return (
    <>
      {selectedUserLocations && (
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
          <LocationHighlight
            userLocations={selectedUserLocations}
            onPress={() => setSelectedUserLocations(null)}
          />
        </Animated.View>
      )}
      <PlatformMap
        onZoom={setZoom}
        onMarkerClick={(id) => {
          const marker = markers.find((marker) => marker.id === id);

          if (!marker) {
            return;
          }

          if (marker.kind === "cluster") {
            setSelectedUserLocations(
              getUserLocationsInCluster(marker.clusterId),
            );
          } else {
            setSelectedUserLocations([marker.userLocation]);
          }
        }}
        onMapClick={() => setSelectedUserLocations(null)}
        markers={markers.map(({ id, title, coordinates }) => ({
          id,
          title,
          coordinates,
        }))}
        cameraPosition={
          query.isLoading || query.result.length < 1
            ? undefined
            : {
                coordinates: {
                  latitude: query.result[0].lat,
                  longitude: query.result[0].lon,
                },
                zoom: DEFAULT_ZOOM,
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
