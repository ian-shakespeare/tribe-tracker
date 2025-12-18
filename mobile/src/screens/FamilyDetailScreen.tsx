import {
  Button,
  Divider,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Family, FamilyMember, Invitation } from "../lib/models";
import { pb } from "../lib";
import { formatDate, toTitleCase } from "../lib/strings";
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import * as SecureStore from "expo-secure-store";
import { SELECTED_FAMILY_KEY } from "../lib/constants";

type FamilyDetailScreenProps = NativeStackScreenProps<
  StackParamList,
  "familydetail"
>;

export default function FamilyDetailScreen({
  navigation,
  route,
}: FamilyDetailScreenProps) {
  const theme = useTheme();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);

  useEffect(() => {
    const familyId = route.params.familyId;
    const user = pb.authStore.record?.id;

    if (!user) {
      // TODO: toast
      return;
    }

    pb.collection<Family>("families")
      .getOne(String(familyId))
      .then((f) => {
        setFamily(f);

        return Promise.all([
          f.createdBy === user
            ? Promise.resolve({ updatedAt: f.createdAt })
            : pb
                .collection<Invitation>("invitations")
                .getFirstListItem(`recipient="${user}" && family="${f.id}"`),
          pb.send<FamilyMember[]>(`/mobile/families/${f.id}/members`, {
            method: "GET",
          }),
        ]);
      })
      .then(([{ updatedAt }, items]) => {
        setJoinedAt(new Date(updatedAt));
        setMembers(items);
      })
      .catch((e: Error) => console.error(e.name + ": " + e.message)); // TODO: toast this
  }, []);

  const renderMenuActions = () => {
    return (
      <TopNavigationAction
        icon={BackArrowIcon}
        onPress={() => navigation.pop()}
      />
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: theme["background-basic-color-1"] }}
    >
      <TopNavigation
        title={toTitleCase(family?.name ?? "Family Detail")}
        alignment="center"
        accessoryLeft={renderMenuActions}
      />
      <Divider />
      <Layout style={{ flex: 1 }}>
        <Text>{JSON.stringify(family)}</Text>
        {!!joinedAt && <Text>Joined {formatDate(joinedAt)}</Text>}
        <Text>Members ({members.length})</Text>
        {members.map(({ firstName, lastName }) => (
          <Text>
            {firstName} {lastName}
          </Text>
        ))}
        <Button
          onPress={() => SecureStore.setItem(SELECTED_FAMILY_KEY, family!.id)}
        >
          Select
        </Button>
        <Button
          onPress={() => {
            pb.authStore.clear();
            navigation.navigate("signin");
          }}
        >
          Sign Out
        </Button>
      </Layout>
    </SafeAreaView>
  );
}
