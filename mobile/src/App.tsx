import * as eva from "@eva-design/eva";
import { NavigationContainer } from "@react-navigation/native";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import AppNavigator from "./views/AppNavigator";
import { ToastProvider } from "./views/contexts/Toast";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SyncProvider } from "./views/contexts/Sync";
import { runMigrations } from "./db/migrations";
import DB from "./db";

SplashScreen.preventAutoHideAsync();
runMigrations(DB);

export default function App() {
  useEffect(() => {
    runMigrations(DB).then(SplashScreen.hideAsync).catch(console.error); // TODO: put this behind the auth stuff
  }, []);

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <ApplicationProvider {...eva} theme={eva.dark}>
            <NavigationContainer>
              <ToastProvider>
                <SyncProvider>
                  <AppNavigator />
                </SyncProvider>
              </ToastProvider>
            </NavigationContainer>
          </ApplicationProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
}
