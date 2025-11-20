import { Button } from "react-native";
import { ThemedText } from "@/src/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { pb } from "@/src/lib";
import * as SecureStore from "expo-secure-store";

export default function TabTwoScreen() {
  const handleReset = () => {
    pb.authStore.clear();
    pb.baseURL = "";
    SecureStore.setItem("API_URL", "");
  };

  return (
    <SafeAreaView>
      <ThemedText type="title">Explore</ThemedText>
      <Button title="Reset" onPress={handleReset} />
    </SafeAreaView>
  );
}
