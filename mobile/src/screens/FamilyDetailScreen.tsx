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
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FamilyDetails, FamilyMember } from "../lib/models";
import { getFamilyDetails } from "../lib";
import { formatDate, toTitleCase } from "../lib/strings";
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { useToast } from "../contexts/Toast";
import { StyleSheet, View } from "react-native";
import InviteIcon from "../components/InviteIcon";
import { useFocusEffect } from "@react-navigation/native";

type ListItemProps = {
  item: FamilyMember;
  index: number;
};

type FamilyDetailScreenProps = NativeStackScreenProps<
  StackParamList,
  "familydetail"
>;

export default function FamilyDetailScreen({
  navigation,
  route,
}: FamilyDetailScreenProps) {
  const theme = useTheme();
  const toast = useToast();
  const [familyDetails, setFamilyDetails] = useState<FamilyDetails | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      const familyId = route.params.familyId;
      getFamilyDetails(familyId)
        .then(setFamilyDetails)
        .catch((e: Error) => toast.danger(e.message));
    }, [route, setFamilyDetails, toast]),
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
