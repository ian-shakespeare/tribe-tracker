import "../services/backgroundLocation";

import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { ToastProvider } from "../views/contexts/Toast";
import { SyncProvider } from "../views/contexts/Sync";
import { runMigrations } from "../db/migrations";
import DB from "../db";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    runMigrations(DB).then(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <ApplicationProvider {...eva} theme={eva.dark}>
            <ToastProvider>
              <SyncProvider>
                <Stack screenOptions={{ headerShown: false }} />
              </SyncProvider>
            </ToastProvider>
          </ApplicationProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
}
