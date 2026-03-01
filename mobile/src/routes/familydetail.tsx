import {
  Divider,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import BackArrowIcon from "../views/components/BackArrowIcon";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useLiveQuery } from "../db/liveQuery";
import {
  FamilyMemberUser,
  getFamily,
  getFamilyMembers,
} from "../models/family";
import { formatDate, toTitleCase } from "../utils/strings";

type ListItemProps = {
  item: FamilyMemberUser;
  index: number;
};

export default function FamilyDetailScreen() {
  const router = useRouter();
  const { familyId } = useLocalSearchParams<{ familyId: string }>();

  const theme = useTheme();
  const query = useLiveQuery(async () => {
    const [family, members] = await Promise.all([
      getFamily(familyId!),
      getFamilyMembers(familyId!),
    ]);

    return { family, members };
  });

  const renderListItem = ({ item }: ListItemProps) => (
    <ListItem
      title={toTitleCase(`${item.firstName} ${item.lastName}`)}
      description={`Joined ${formatDate(new Date(item.joinedAt))}`}
      style={styles.listItem}
    />
  );

  const renderBackAction = () => (
    <TopNavigationAction icon={BackArrowIcon} onPress={() => router.back()} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text category="p1" appearance="hint" style={styles.emptyText}>
        Loading...
      </Text>
    </View>
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
        title={
          query.isLoading
            ? "Loading..."
            : toTitleCase(query.result.family?.name ?? "Unknown")
        }
        alignment="center"
        accessoryLeft={renderBackAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <List
          data={query.isLoading ? [] : query.result.members}
          renderItem={renderListItem}
          ListEmptyComponent={renderEmpty}
        />
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
  listItem: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyText: {
    textAlign: "center",
  },
});
