import { AppleMaps, CameraPosition, Coordinates, GoogleMaps } from "expo-maps";
import { Platform, Text } from "react-native";

type PlatformMapMarker = {
  id: string;
  title: string;
  coordinates: Coordinates;
};

type PlatformMapProps = {
  markers?: PlatformMapMarker[];
  cameraPosition?: CameraPosition;
  onMarkerClick?: (id: string) => void;
  onMapClick?: () => void;
};

export default function PlatformMap({
  markers,
  cameraPosition,
  onMarkerClick,
  onMapClick,
}: PlatformMapProps) {
  if (Platform.OS === "ios") {
    return (
      <AppleMaps.View
        style={{ flex: 1 }}
        markers={markers}
        cameraPosition={cameraPosition}
        onMapClick={onMapClick}
        onMarkerClick={({ id }) => {
          if (id) {
            onMarkerClick?.(id);
          }
        }}
      />
    );
  } else if (Platform.OS === "android") {
    return (
      <GoogleMaps.View
        style={{ flex: 1 }}
        markers={markers}
        cameraPosition={cameraPosition}
        onMapClick={onMapClick}
        onMarkerClick={({ id }) => {
          if (id) {
            onMarkerClick?.(id);
          }
        }}
      />
    );
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}
