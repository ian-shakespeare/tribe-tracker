import { Button, Input, Layout, Text, useTheme } from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { View } from "react-native";
import SecureInput from "../components/SecureInput";
import {
  getBaseUrl,
  isSignedIn,
  refreshAuth,
  createUser,
  saveBaseUrl,
  signIn,
} from "../lib";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { useToast } from "../contexts/Toast";

type SignInScreenProps = NativeStackScreenProps<StackParamList, "signin">;

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const theme = useTheme();
  const toast = useToast();

  const [authMode, setAuthMode] = useState<"sign-in" | "register">("sign-in");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (isSignedIn()) {
      navigation.navigate("tabs" as never);
      return;
    }

    refreshAuth()
      .then(() => navigation.navigate("tabs" as never))
      .catch(() => {
        const baseUrl = getBaseUrl();
        setApiUrl(baseUrl);
      });
  }, [navigation]);

  const handleSubmit = async () => {
    try {
      if (getBaseUrl() !== apiUrl) {
        const url = new URL(apiUrl);
        saveBaseUrl(url);
      }

      if (authMode === "register") {
        const data = {
          email: email.trim().toLowerCase(),
          firstName: firstName.trim().toLowerCase(),
          lastName: lastName.trim().toLowerCase(),
          avatar: null,
          password: password.trim(),
          passwordConfirm: confirmPassword.trim(),
        };
        await createUser(data);
      }

      await signIn(email.trim().toLowerCase(), password);
      navigation.navigate("tabs");
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.name);
        console.error(e.message);
        console.error(e.cause);
        console.error(e.stack);
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
