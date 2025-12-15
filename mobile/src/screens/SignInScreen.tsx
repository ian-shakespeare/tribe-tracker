import { useNavigation } from "@react-navigation/native";
import { Button, Input, Layout, Text, useTheme } from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { View } from "react-native";
import SecureInput from "../components/SecureInput";
import { pb } from "../lib";
import * as SecureStore from "expo-secure-store";
import { API_URL_KEY } from "../lib/constants";

export default function SignInScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  const [authMode, setAuthMode] = useState<"sign-in" | "register">("sign-in");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (pb.authStore.isValid) {
      navigation.navigate("tabs" as never);
      return;
    }

    pb.collection("users")
      .authRefresh()
      .then(() => navigation.navigate("tabs" as never))
      .catch(() => pb.baseURL && setApiUrl(pb.baseURL));
  }, []);

  const handleSubmit = async () => {
    try {
      if (pb.baseURL !== apiUrl) {
        const url = new URL(apiUrl);
        pb.baseURL = url.toString();
        SecureStore.setItem(API_URL_KEY, url.toString());
      }

      if (authMode == "register") {
        const data = {
          firstName: firstName.trim().toLowerCase(),
          lastName: lastName.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          passwordConfirm: confirmPassword.trim(),
          emailVisibility: true,
        };
        await pb.collection("users").create(data);
        await pb.collection("users").authWithPassword(email, password);
      }

      await pb.collection("users").authWithPassword(email, password);
      navigation.navigate("tabs" as never);
    } catch (e) {
      if (e instanceof Error) {
        // TODO: toast this
        console.error(e.message);
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
