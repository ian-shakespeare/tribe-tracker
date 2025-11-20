import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native";
import { useState } from "react";
import { pb } from "@/src/lib";
import { ThemedTextInput } from "../themed-text-input";
import { ThemedText } from "../themed-text";
import * as SecureStore from "expo-secure-store";

type SetupProps = {
  onComplete?: () => void;
};

export function Setup({ onComplete }: SetupProps) {
  const [host, setHost] = useState("");

  const handleSubmit = async () => {
    const hasScheme = host.startsWith("http://") || host.startsWith("https://");

    try {
      const url = hasScheme ? new URL(host) : new URL("https://" + host);
      SecureStore.setItem("API_URL", String(url));
      pb.baseURL = String(url);
    } catch (e) {
      if (e instanceof Error) {
        console.error("Invalid URL"); // TODO: toast and log
      }
      return;
    }

    try {
      const health = await pb.health.check();
      if (health.code !== 200) {
        throw Error(
          `PocketBase server responded with an unexpected status code: ${health.code} (expected 200).`,
        );
      }
      onComplete?.call(null);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message); // TODO: use a real logger and save this somewhere, also maybe toast
      }
      pb.baseURL = "";
      setHost("");
    }
  };

  return (
    <SafeAreaView>
      <ThemedText type="title">Tribe Tracker</ThemedText>
      <ThemedTextInput
        inputMode="url"
        autoCorrect={false}
        autoCapitalize="none"
        placeholder="Host URL"
        value={host}
        onChangeText={setHost}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </SafeAreaView>
  );
}
