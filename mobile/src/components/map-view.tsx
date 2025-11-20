import { AppleMaps, GoogleMaps } from "expo-maps";
import { Platform } from "react-native";
import { ThemedText } from "@/src/components/themed-text";

export function MapView() {
  if (Platform.OS === "ios") {
    return <AppleMaps.View style={{ flex: 1 }} />;
  } else if (Platform.OS === "android") {
    return <GoogleMaps.View style={{ flex: 1 }} />;
  } else {
    return <ThemedText>Maps are not supported on this platform.</ThemedText>;
  }
}
