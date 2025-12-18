import { AppleMaps, GoogleMaps } from "expo-maps";
import { Platform, Text } from "react-native";
import { Coordinates } from "../lib/models";

type PlatformMapMarker = {
  title: string;
  coordinates: Coordinates;
};

type PlatformMapProps = {
  markers: PlatformMapMarker[];
};

export default function PlatformMap({ markers }: PlatformMapProps) {
  const platformMarkers = markers.map(
    ({ title, coordinates: { lat, lon } }) => ({
      title,
      coordinates: { latitude: lat, longitude: lon },
    }),
  );

  if (Platform.OS === "ios") {
    return <AppleMaps.View style={{ flex: 1 }} markers={platformMarkers} />;
  } else if (Platform.OS === "android") {
    return <GoogleMaps.View style={{ flex: 1 }} markers={platformMarkers} />;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}
