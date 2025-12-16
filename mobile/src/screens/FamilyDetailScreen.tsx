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
import { Family, Invitation } from "../lib/models";
import { pb } from "../lib";
import { formatDate, toTitleCase } from "../lib/strings";
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";

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
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);

  useEffect(() => {
    const familyId = route.params.familyId;

    pb.collection<Family>("families")
      .getOne(String(familyId))
      .then(setFamily)
      .catch((e: Error) => console.error(e.name + ": " + e.message)); // TODO: toast this
  }, []);

  useEffect(() => {
    const user = pb.authStore.record?.id;
    if (!user) {
      // TODO: toast
      return;
    }

    if (!family) {
      // TODO: toast
      return;
    }

    if (family.createdBy === user) {
      setJoinedAt(new Date(family.createdAt));
      return;
    }

    pb.collection<Invitation>("invitations")
      .getFirstListItem(`recipient="${user}" && family="${family.id}"`)
      .then(({ updatedAt }) => setJoinedAt(new Date(updatedAt)))
      .catch(console.error); // TODO: toast
  }, [family]);

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
