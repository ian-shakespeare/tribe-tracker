import { Button, Input, Layout, Text, useTheme } from "@ui-kitten/components";
import { useState } from "react";
import { View } from "react-native";
import SecureInput from "../views/components/SecureInput";
import api from "../services/api";
import { useRouter } from "expo-router";
import { useToast } from "../views/contexts/Toast";
import { upsertUser } from "../models/user";
import * as SecureStore from "expo-secure-store";
import { useSync } from "../views/contexts/Sync";

export default function SignInScreen() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  const { sync } = useSync();

  const [authMode, setAuthMode] = useState<"sign-in" | "register">("sign-in");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [apiUrl, setApiUrl] = useState(api.baseUrl?.href ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    try {
      if (api.baseUrl?.href !== apiUrl) {
        const url = new URL(apiUrl);
        api.baseUrl = url;
      }

      if (authMode === "register") {
        const res = await api.registerUser(
          email.trim().toLowerCase(),
          firstName.trim().toLowerCase(),
          lastName.trim().toLowerCase(),
          password.trim(),
          confirmPassword.trim(),
        );
        if (!res.ok) {
          toast.danger(res.error.message);
          return;
        }
      } else {
        const res = await api.signIn(email.trim().toLowerCase(), password);
        if (!res.ok) {
          toast.danger(res.error.message);
          return;
        }
      }

      const res = await api.getMe();
      if (!res.ok) {
        toast.danger(res.error.message);
        return;
      }

      const created = await upsertUser({
        ...res.user,
        createdAt: new Date(res.user.createdAt),
        updatedAt: new Date(res.user.updatedAt),
      });

      if (!created.success) {
        throw created.error;
      }

      await SecureStore.setItemAsync("MY_USER_ID", res.user.id).then(sync);

      router.replace("/(tabs)/map");
    } catch (e) {
      if (e instanceof Error) {
        toast.danger(e.message);
      }
    }
  };

  return (
    <Layout
      style={{
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flex: 2, justifyContent: "center", gap: 8 }}>
        <Text category="h1">Tribe Tracker</Text>
        <Input
          placeholder="Self Host URL"
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          inputMode="url"
        />
        {authMode === "register" && (
          <>
            <Input
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              autoCorrect={false}
              autoComplete="name-given"
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              autoCorrect={false}
              autoComplete="name-family"
            />
          </>
        )}
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          inputMode="email"
        />
        <SecureInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
        {authMode === "register" && (
          <SecureInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}
        <Button style={{ marginVertical: 4 }} onPress={handleSubmit}>
          Submit
        </Button>
        {(
          [
            ["register", "Don't have an account?", "Register."],
            ["sign-in", "Already have an account?", "Sign In."],
          ] as const
        ).map(
          ([mode, prompt, label], i) =>
            authMode !== mode && (
              <View key={i}>
                <Text style={{ textAlign: "center" }}>
                  {prompt + " "}
                  <Text
                    onPress={() => setAuthMode(mode)}
                    style={{
                      textAlign: "center",
                      textDecorationLine: "underline",
                      color: theme["text-primary-color"],
                    }}
                  >
                    {label}
                  </Text>
                </Text>
              </View>
            ),
        )}
      </View>
      <View style={{ flex: 1 }} />
    </Layout>
  );
}
