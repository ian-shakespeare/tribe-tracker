import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";

import { HapticTab } from "@/src/components/haptic-tab";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Colors } from "@/src/constants/theme";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { pb } from "@/src/lib";
import { Setup } from "@/src/components/screens/setup";
import { SignIn } from "@/src/components/screens/sign-in";

type Requirements = "setup" | "auth";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [requirements, setRequirements] = useState<Requirements | null>(null);

  useEffect(() => {
    if (!pb.baseURL) {
      setRequirements("setup");
    } else if (!pb.authStore.isValid) {
      setRequirements("auth");
    }
  }, []);

  return requirements === "setup" ? (
    <Setup onComplete={() => setRequirements("auth")} />
  ) : requirements === "auth" ? (
    <SignIn onComplete={() => setRequirements(null)} />
  ) : (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
