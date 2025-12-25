import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Tribe Tracker",
  slug: "tribe-tracker",
  version: "0.0.9",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#1A2138",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "dev.shakespeare.tribetracker",
    icon: {
      dark: "./assets/ios-dark.png",
      light: "./assets/ios-light.png",
      tinted: "./assets/ios-tinted.png",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#1A2138",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "dev.shakespeare.tribetracker",
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_API_KEY,
      },
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-maps",
      {
        requestLocationPermission: true,
        locationPermission: "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    "expo-secure-store",
  ],
});
