import {
  Button,
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
import { StyleSheet, View } from "react-native";
import { useToast } from "../contexts/Toast";
import AvatarHero from "../components/AvatarHero";
import PencilIcon from "../components/PencilIcon";
import { useLiveQuery } from "../../db/liveQuery";
import { getUser } from "../../models/user";
import * as SecureStore from "expo-secure-store";
import { signOut } from "../../controllers/api";
import { formatDate } from "../../utils/strings";
import GearIcon from "../components/GearIcon";

const AVATAR_SIZE = 200;

type ProfileScreenProps = NativeStackScreenProps<StackParamList, "profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();
  const toast = useToast();

  const query = useLiveQuery(async () => {
    const userId = await SecureStore.getItemAsync("MY_USER_ID");
    if (!userId) {
      toast.danger("Failed to get my user ID.");
      return null;
    }

    return await getUser(userId);
  });

  const handleSignOut = () => {
    signOut();
    SecureStore.deleteItemAsync("MY_USER_ID").then(() =>
      navigation.replace("signin"),
    );
  };

  const renderEditAction = () => (
    <TopNavigationAction
      icon={PencilIcon}
      onPress={() => navigation.navigate("profileedit")}
    />
  );

  const renderSettingsAction = () => (
    <TopNavigationAction
      icon={GearIcon}
      onPress={() => navigation.navigate("settings")}
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
        title="Profile"
        alignment="center"
        accessoryLeft={renderEditAction}
        accessoryRight={renderSettingsAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <View style={styles.container}>
          <View style={styles.content}>
            {query.isLoading ? (
              <Text category="p1" appearance="hint" style={styles.text}>
                Loading...
              </Text>
            ) : !query.result ? (
              <Text category="p1" appearance="hint" style={styles.text}>
                No User Found
              </Text>
            ) : (
              <View>
                <AvatarHero
                  size={AVATAR_SIZE}
                  avatar={query.result.avatar}
                  firstName={query.result.firstName}
                  lastName={query.result.lastName}
                />
                <Text category="h1" style={styles.nameText}>
                  {`${query.result.firstName} ${query.result.lastName}`}
                </Text>
                <Text category="p1" style={styles.text}>
                  {query.result.email}
                </Text>
                <Text category="p1" appearance="hint" style={styles.text}>
                  Joined {formatDate(new Date(query.result.createdAt))}
                </Text>
              </View>
            )}
            <Button style={styles.button} onPress={handleSignOut}>
              Sign Out
            </Button>
          </View>
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
  content: {
    justifyContent: "space-between",
    height: "100%",
  },
  nameText: {
    textTransform: "capitalize",
    textAlign: "center",
  },
  button: {
    width: "100%",
  },
});
