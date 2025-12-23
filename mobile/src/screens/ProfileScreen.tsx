import {
  Divider,
  Layout,
  Text,
  TopNavigation,
  useTheme,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { StyleSheet } from "react-native";

type ProfileScreenProps = NativeStackScreenProps<StackParamList, "profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation title="Profile" alignment="center" />
      <Divider />
      <Layout style={styles.layout}>
        <Text>Profile</Text>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  layout: {
    flex: 1,
  },
});
