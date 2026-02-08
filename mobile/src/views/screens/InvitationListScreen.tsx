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

type InvitationListScreenProps = NativeStackScreenProps<
  StackParamList,
  "invitationlist"
>;

export default function InvitationListScreen({
  navigation,
}: InvitationListScreenProps) {
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
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
