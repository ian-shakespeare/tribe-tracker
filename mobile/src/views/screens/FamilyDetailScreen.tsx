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
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { StyleSheet, View } from "react-native";
import InviteIcon from "../components/InviteIcon";
import { useLiveQuery } from "../../db/liveQuery";
import {
  FamilyMemberUser,
  getFamily,
  getFamilyMembers,
} from "../../models/family";
import { formatDate, toTitleCase } from "../../utils/strings";

type FamilyDetailScreenProps = NativeStackScreenProps<
  StackParamList,
  "familydetail"
>;

type ListItemProps = {
  item: FamilyMemberUser;
  index: number;
};

export default function FamilyDetailScreen({
  navigation,
  route,
}: FamilyDetailScreenProps) {
  const { familyId } = route.params;

  const theme = useTheme();
  const query = useLiveQuery(async () => {
    const [family, members] = await Promise.all([
      getFamily(familyId),
      getFamilyMembers(familyId),
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
    <TopNavigationAction
      icon={BackArrowIcon}
      onPress={() => navigation.pop()}
    />
  );

  const renderInviteAction = () => (
    <TopNavigationAction
      icon={InviteIcon}
      onPress={() =>
        navigation.navigate("familyinvite", {
          familyId: route.params.familyId,
        })
      }
    />
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
        accessoryRight={renderInviteAction}
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
