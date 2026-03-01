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
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ["location"],
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
  extra: {
    eas: {
      projectId: "1ca6b391-8089-4e22-9268-cb4b9e354cbc",
    },
  },
  plugins: [
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow $(PRODUCT_NAME) to access your photos to select a profile picture.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    [
      "expo-maps",
      {
        requestLocationPermission: true,
        locationPermission: "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    "expo-secure-store",
    "expo-sqlite",
    "expo-task-manager",
  ],
});
