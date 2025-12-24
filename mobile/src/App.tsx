import * as eva from "@eva-design/eva";
import { NavigationContainer } from "@react-navigation/native";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import AppNavigator from "./AppNavigator";
import { ToastProvider } from "./contexts/Toast";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <ApplicationProvider {...eva} theme={eva.dark}>
            <NavigationContainer>
              <ToastProvider>
                <AppNavigator />
              </ToastProvider>
            </NavigationContainer>
          </ApplicationProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
}
