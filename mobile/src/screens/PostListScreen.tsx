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
import { StyleSheet, View } from "react-native";

type PostListScreenProps = NativeStackScreenProps<StackParamList, "postlist">;

export default function PostListScreen({}: PostListScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation title="Posts" alignment="center" />
      <Divider />
      <Layout style={styles.layout}>
        <View style={styles.container}>
          <Text category="p1" appearance="hint" style={styles.text}>
            Coming Soon
          </Text>
        </View>
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
  text: {
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
