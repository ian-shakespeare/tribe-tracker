import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import api from "../services/api";

export default function Index() {
  const [destination, setDestination] = useState<
    "/(tabs)/map" | "/signin" | null
  >(null);

  useEffect(() => {
    if (api.isAuthenticated) {
      setDestination("/(tabs)/map");
    } else {
      setDestination("/signin");
    }
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
