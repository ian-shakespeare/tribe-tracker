import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Divider,
  Layout,
  List,
  ListItem,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import BackArrowIcon from "../components/BackArrowIcon";
import { Alert, StyleSheet } from "react-native";
import { useSync } from "../contexts/Sync";
import { ReactElement, useCallback } from "react";
import { useLiveQuery } from "../../db/liveQuery";
import { getDatabaseSize } from "../../models/meta";
import { deleteAllLocations } from "../../models/locations";
import { deleteAllFamilyMembers } from "../../models/familyMember";
import { deleteAllFamilies } from "../../models/family";
import { deleteAllUsers } from "../../models/user";
import * as SecureStore from "expo-secure-store";
import { signOut } from "../../controllers/api";

type ListItemProps = {
  title: string;
  description: string;
  accessoryRight?: () => ReactElement;
};

type SettingsScreenProps = NativeStackScreenProps<StackParamList, "settings">;

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const theme = useTheme();
  const { lastSyncedAt, resetSync } = useSync();
  const query = useLiveQuery(getDatabaseSize);

  const purgeAllData = useCallback(async () => {
    await deleteAllLocations();
    await deleteAllFamilyMembers();
    await deleteAllFamilies();
    await deleteAllUsers();

    signOut();
    await SecureStore.deleteItemAsync("MY_USER_ID");
    navigation.replace("signin");
  }, [navigation]);

  const options: ListItemProps[] = [
    {
      title: "Last Sync",
      description: lastSyncedAt.toLocaleString(),
      accessoryRight: () => (
        <Button size="tiny" onPress={resetSync}>
          RESET
        </Button>
      ),
    },
    {
      title: "Disk Usage",
      description: query.isLoading
        ? "..."
        : !query.result.success
          ? "Unknown"
          : `${query.result.size} bytes`,
      accessoryRight: () => (
        <Button
          size="tiny"
          status="danger"
          onPress={() =>
            Alert.alert(
              "Purge Data",
              "All local data will be deleted and you will be signed out.",
              [
                { text: "Cancel", onPress: () => {} },
                {
                  text: "OK",
                  onPress: purgeAllData,
                  isPreferred: true,
                },
              ],
            )
          }
        >
          PURGE
        </Button>
      ),
    },
  ];

  const renderBackAction = () => (
    <TopNavigationAction
      icon={BackArrowIcon}
      onPress={() => navigation.pop()}
    />
  );

  const renderListItem = ({ item }: { item: ListItemProps }) => (
    <ListItem
      title={item.title}
      description={item.description}
      accessoryRight={item.accessoryRight}
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
        title="Settings"
        alignment="center"
        accessoryLeft={renderBackAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <List data={options} renderItem={renderListItem} />
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
