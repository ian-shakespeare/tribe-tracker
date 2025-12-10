import { useNavigation } from "@react-navigation/native";
import { Button, Layout, Text } from "@ui-kitten/components";

export default function SignInScreen() {
  const navigation = useNavigation();

  return (
    <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text category="h1">Sign In</Text>
      <Button onPress={() => navigation.navigate("main" as never)}>
        Submit
      </Button>
    </Layout>
  );
}
