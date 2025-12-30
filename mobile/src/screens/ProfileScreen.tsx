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
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getMe, signOut } from "../lib";
import { useToast } from "../contexts/Toast";
import { User } from "../lib/models";
import { formatDate } from "../lib/strings";
import AvatarHero from "../components/AvatarHero";
import BellIcon from "../components/BellIcon";
import PencilIcon from "../components/PencilIcon";

const AVATAR_SIZE = 200;

type ProfileScreenProps = NativeStackScreenProps<StackParamList, "profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      getMe()
        .then(setUser)
        .catch((e: Error) => toast.danger(e.message));
    }, []),
  );

  const handleSignOut = () => {
    signOut();
    navigation.replace("signin");
  };

  const renderEditAction = () => (
    <TopNavigationAction
      icon={PencilIcon}
      onPress={() => console.log("TODO: create edit profile screen")}
    />
  );

  const renderNotificationAction = () => (
    <TopNavigationAction
      icon={BellIcon}
      onPress={() => navigation.navigate("invitationlist")}
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
        accessoryRight={renderNotificationAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <View style={styles.container}>
          <View style={styles.content}>
            {!user ? (
              <Text category="p1" appearance="hint" style={styles.text}>
                Loading...
              </Text>
            ) : (
              <View>
                <AvatarHero size={AVATAR_SIZE} user={user} />
                <Text category="h1" style={styles.nameText}>
                  {`${user.firstName} ${user.lastName}`}
                </Text>
                <Text category="p1" style={styles.text}>
                  {user.email}
                </Text>
                <Text category="p1" appearance="hint" style={styles.text}>
                  Joined {formatDate(new Date(user.created))}
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
