import {
  Divider,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { StyleSheet } from "react-native";
import BackArrowIcon from "../components/BackArrowIcon";

type FamilyInviteScreenProps = NativeStackScreenProps<
  StackParamList,
  "familyinvite"
>;

export default function FamilyInviteScreen({
  navigation,
}: FamilyInviteScreenProps) {
  const theme = useTheme();

  const renderBackAction = () => (
    <TopNavigationAction
      icon={BackArrowIcon}
      onPress={() => navigation.pop()}
    />
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation
        title="Invitations"
        alignment="center"
        accessoryLeft={renderBackAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <Text>TODO</Text>
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
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  headerInput: {
    flex: 1,
  },
  text: {
    textAlign: "center",
    lineHeight: 24,
  },
  emptyText: {
    textAlign: "center",
  },
  highlight: {
    textDecorationLine: "underline",
  },
});
