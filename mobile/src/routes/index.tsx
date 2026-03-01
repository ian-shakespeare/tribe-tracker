import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { isSignedIn, refreshAuth } from "../controllers/api";

export default function Index() {
  const [destination, setDestination] = useState<
    "/(tabs)/map" | "/signin" | null
  >(null);

  useEffect(() => {
    if (isSignedIn()) {
      setDestination("/(tabs)/map");
      return;
    }

    refreshAuth()
      .then(() => setDestination("/(tabs)/map"))
      .catch(() => setDestination("/signin"));
  }, []);

  useEffect(() => {
    if (destination) {
      SplashScreen.hideAsync();
    }
  }, [destination]);

  if (!destination) {
    return null;
  }

  return <Redirect href={destination} />;
}
