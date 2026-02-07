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
import { useEffect } from "react";
import { db, getMyUserId, signOut } from "../lib";
import { useToast } from "../contexts/Toast";
import { formatDate } from "../lib/strings";
import AvatarHero from "../components/AvatarHero";
import BellIcon from "../components/BellIcon";
import PencilIcon from "../components/PencilIcon";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

const AVATAR_SIZE = 200;

type ProfileScreenProps = NativeStackScreenProps<StackParamList, "profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const userId = getMyUserId();
  const theme = useTheme();
  const toast = useToast();

  const { data, error } = useLiveQuery(
    db.select().from(usersTable).where(eq(usersTable.id, userId)),
  );

  // TODO: render `error` if exists

  const user = data.at(0) ?? null;

  const handleSignOut = () => {
    signOut();
    navigation.replace("signin");
  };

  const renderEditAction = () => (
    <TopNavigationAction
      icon={PencilIcon}
      onPress={() => navigation.navigate("profileedit")}
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
                <AvatarHero
                  size={AVATAR_SIZE}
                  avatar={user.avatar}
                  firstName={user.firstName}
                  lastName={user.lastName}
                />
                <Text category="h1" style={styles.nameText}>
                  {`${user.firstName} ${user.lastName}`}
                </Text>
                <Text category="p1" style={styles.text}>
                  {user.email}
                </Text>
                <Text category="p1" appearance="hint" style={styles.text}>
                  Joined {formatDate(new Date(user.createdAt))}
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
