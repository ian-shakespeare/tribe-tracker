import * as eva from "@eva-design/eva";
import { NavigationContainer } from "@react-navigation/native";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import AppNavigator from "./AppNavigator";
import { LocationsProvider } from "./contexts/Locations";
import * as SecureStore from "expo-secure-store";
import { SELECTED_FAMILY_KEY } from "./lib/constants";
import { ToastProvider } from "./contexts/Toast";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <LocationsProvider
        initialFamilyId={SecureStore.getItem(SELECTED_FAMILY_KEY)}
      >
        <SafeAreaProvider>
          <ApplicationProvider {...eva} theme={eva.dark}>
            <NavigationContainer>
              <ToastProvider>
                <AppNavigator />
              </ToastProvider>
            </NavigationContainer>
          </ApplicationProvider>
        </SafeAreaProvider>
      </LocationsProvider>
    </>
  );
}
