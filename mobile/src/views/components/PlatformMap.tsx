import { AppleMaps, CameraPosition, Coordinates, GoogleMaps } from "expo-maps";
import { Platform, Text } from "react-native";

type PlatformMapMarker = {
  title: string;
  coordinates: Coordinates;
};

type PlatformMapProps = {
  markers?: PlatformMapMarker[];
  cameraPosition?: CameraPosition;
};

export default function PlatformMap({
  markers,
  cameraPosition,
}: PlatformMapProps) {
  if (Platform.OS === "ios") {
    return (
      <AppleMaps.View
        style={{ flex: 1 }}
        markers={markers}
        cameraPosition={cameraPosition}
      />
    );
  } else if (Platform.OS === "android") {
    return (
      <GoogleMaps.View
        style={{ flex: 1 }}
        markers={markers}
        cameraPosition={cameraPosition}
      />
    );
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}
