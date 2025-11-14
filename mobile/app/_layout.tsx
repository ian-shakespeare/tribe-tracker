import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import PocketBase, { AsyncAuthStore } from "pocketbase";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const apiUrl = SecureStore.getItem("API_URL");
  if (!apiUrl) {
    // TODO: error
  }

  const store = new AsyncAuthStore({
    save: async (serialized) => SecureStore.setItem("pb_auth", serialized),
    initial: SecureStore.getItem("pb_auth") ?? undefined,
  });

  const pb = new PocketBase(apiUrl!, store);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
