import {
  Button,
  Divider,
  Input,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Invitation, User } from "../lib/models";
import { createInvitation, getPendingInvitations, getUsers } from "../lib";
import { formatDate, toTitleCase } from "../lib/strings";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { StyleSheet, View } from "react-native";
import { useToast } from "../contexts/Toast";
import { useFocusEffect } from "@react-navigation/native";
import BackArrowIcon from "../components/BackArrowIcon";

type ListItemProps = {
  item: Invitation;
  index: number;
};

type FamilyInviteScreenProps = NativeStackScreenProps<
  StackParamList,
  "familyinvite"
>;

export default function FamilyInviteScreen({
  navigation,
  route,
}: FamilyInviteScreenProps) {
  const theme = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<Map<string, User> | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
    [],
  );

  useFocusEffect(
    useCallback(() => {
      const familyId = route.params.familyId;
      getPendingInvitations(familyId)
        .then(setPendingInvitations)
        .catch((e: Error) => toast.error(e.message));
    }, [route, setPendingInvitations, toast]),
  );

  useEffect(() => {
    if (pendingInvitations.length < 1) return;

    getUsers(pendingInvitations.map(({ recipient }) => recipient))
      .then((u) => setUsers(new Map(u.map((user) => [user.id, user]))))
      .catch((e: Error) => toast.error(e.message));
  }, [pendingInvitations, setUsers, toast]);

  const handleSendInvite = () => {
    const familyId = route.params.familyId;
    createInvitation(familyId, email.trim().toLowerCase())
      .then((invitation) =>
        setPendingInvitations((prev) => [...prev, invitation]),
      )
      .catch((e: Error) => toast.error(e.message));
  };

  const renderListItem = ({ item }: ListItemProps) => {
    const user = users?.get(item.recipient);
    return (
      <ListItem
        title={toTitleCase(
          `${user?.firstName ?? "unknown"} ${user?.lastName ?? "user"}`,
        )}
        description={`Sent ${formatDate(new Date(item.createdAt))}`}
        style={{ paddingHorizontal: 16 }}
      />
    );
  };

  const renderBackAction = () => (
    <TopNavigationAction
      icon={BackArrowIcon}
      onPress={() => navigation.pop()}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        inputMode="email"
        style={styles.headerInput}
      />
      <Button onPress={handleSendInvite}>Send</Button>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.container}>
      <Text category="p1" appearance="hint" style={styles.emptyText}>
        No Pending Invites.
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
        title="Invitations"
        alignment="center"
        accessoryLeft={renderBackAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <List
          keyExtractor={({ id }) => String(id)}
          data={pendingInvitations}
          renderItem={renderListItem}
          ListHeaderComponent={renderHeader}
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
