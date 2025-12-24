import {
  Button,
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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { StyleSheet, View } from "react-native";
import BackArrowIcon from "../components/BackArrowIcon";
import { FamilyInvitation } from "../lib/models";
import { formatDate } from "../lib/strings";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { acceptInvitation, declineInvitation, getMyInvitations } from "../lib";
import { useToast } from "../contexts/Toast";
import RefreshIcon from "../components/RefreshIcon";

type ListItemProps = {
  item: FamilyInvitation;
  index: number;
};

type InvitationListScreenProps = NativeStackScreenProps<
  StackParamList,
  "invitationlist"
>;

export default function InvitationListScreen({
  navigation,
}: InvitationListScreenProps) {
  const theme = useTheme();
  const toast = useToast();
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);

  useFocusEffect(
    useCallback(() => {
      getMyInvitations()
        .then(setInvitations)
        .catch((e: Error) => toast.danger(e.message));
    }, [toast]),
  );

  const renderBackAction = () => (
    <TopNavigationAction
      icon={BackArrowIcon}
      onPress={() => navigation.pop()}
    />
  );

  const renderRefreshAction = () => (
    <TopNavigationAction
      icon={RefreshIcon}
      onPress={() =>
        getMyInvitations()
          .then(setInvitations)
          .catch((e: Error) => toast.danger(e.message))
      }
    />
  );

  const renderListItemActions = (invitationId: string) => (
    <View style={{ flexDirection: "row", gap: 6 }}>
      <Button
        size="tiny"
        status="danger"
        onPress={() => {
          declineInvitation(invitationId)
            .then(() =>
              setInvitations((prev) =>
                prev.filter(({ id }) => id !== invitationId),
              ),
            )
            .catch((e: Error) => toast.danger(e.message));
        }}
      >
        DECLINE
      </Button>
      <Button
        size="tiny"
        onPress={() => {
          acceptInvitation(invitationId)
            .then((familyId) =>
              navigation.replace("familydetail", { familyId }),
            )
            .catch((e: Error) => toast.danger(e.message));
        }}
      >
        ACCEPT
      </Button>
    </View>
  );

  const renderListItem = ({ item }: ListItemProps) => (
    <ListItem
      disabled
      title={item.familyName}
      description={`Sent ${formatDate(new Date(item.createdAt))}`}
      accessoryRight={() => renderListItemActions(item.id)}
    />
  );

  const renderListEmpty = () => (
    <View style={styles.container}>
      <Text category="p1" appearance="hint" style={{ textAlign: "center" }}>
        No Pending Invitations.
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
        accessoryRight={renderRefreshAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        <List
          data={invitations}
          renderItem={renderListItem}
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={renderListEmpty}
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
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
