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
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../lib";
import { formatDate, toTitleCase } from "../lib/strings";
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { useToast } from "../contexts/Toast";
import { StyleSheet, View } from "react-native";
import InviteIcon from "../components/InviteIcon";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { familiesTable, familyMembersTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

type FamilyDetailScreenProps = NativeStackScreenProps<
  StackParamList,
  "familydetail"
>;

type FamilyDetail = {
  id: string;
  name: string;
  members: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    joinedAt: string;
  }[];
};

type ListItemProps = {
  item: FamilyDetail["members"][number];
  index: number;
};

export default function FamilyDetailScreen({
  navigation,
  route,
}: FamilyDetailScreenProps) {
  const { familyId } = route.params;

  const theme = useTheme();
  const toast = useToast();
  const { data, error } = useLiveQuery(
    db
      .select()
      .from(familiesTable)
      .innerJoin(
        familyMembersTable,
        eq(familiesTable.id, familyMembersTable.family),
      )
      .innerJoin(usersTable, eq(familyMembersTable.user, usersTable.id))
      .where(eq(familiesTable.id, familyId)),
  );

  // TODO: render error

  const familyDetails = data.reduce<FamilyDetail>(
    ({ members }, curr) => {
      return {
        id: curr.families.id,
        name: curr.families.name,
        members: [
          ...members,
          { ...curr.users, joinedAt: curr.familyMembers.createdAt },
        ],
      };
    },
    {
      id: "",
      name: "",
      members: [],
    },
  );

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
        title={toTitleCase(familyDetails?.name ?? "Family Detail")}
        alignment="center"
        accessoryLeft={renderBackAction}
        accessoryRight={renderInviteAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <List
          data={familyDetails?.members ?? []}
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
