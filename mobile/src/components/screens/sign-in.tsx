import { ThemedText } from "@/src/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ThemedTextInput } from "../themed-text-input";
import { Button } from "react-native";
import { pb } from "@/src/lib";

type Mode = "sign-in" | "register";

type SignInProps = {
  onComplete?: () => void;
};

export function SignIn({ onComplete }: SignInProps) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = async () => {
    try {
      if (mode === "register") {
        const data = {
          firstName: firstName.trim().toLowerCase(),
          lastName: lastName.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          passwordConfirm: passwordConfirm.trim(),
          emailVisibility: true,
        };
        await pb.collection("users").create(data);
      }
      await pb.collection("users").authWithPassword(email, password);
      onComplete?.call(null);
    } catch (e) {
      console.error(`failed to sign in: ${e.message}`); // TODO: toast/log
      return;
    }
  };

  return (
    <SafeAreaView>
      <ThemedText type="title">
        {mode === "sign-in" ? "Sign In" : "Register"}
      </ThemedText>
      {mode === "register" && (
        <>
          <ThemedTextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <ThemedTextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </>
      )}
      <ThemedTextInput
        inputMode="email"
        autoCapitalize="none"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <ThemedTextInput
        secureTextEntry
        autoCapitalize="none"
        placeholder="Password"
        autoCorrect={false}
        value={password}
        onChangeText={setPassword}
      />
      {mode === "register" ? (
        <>
          <ThemedTextInput
            secureTextEntry
            autoCapitalize="none"
            placeholder="Confirm Password"
            autoCorrect={false}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
          />
          <Button title="Sign In" onPress={() => setMode("sign-in")} />
        </>
      ) : (
        <Button title="Register" onPress={() => setMode("register")} />
      )}
      <Button title="Submit" onPress={handleSubmit} />
    </SafeAreaView>
  );
}
