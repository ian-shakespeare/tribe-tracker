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
import { FamilyDetails } from "../lib/models";
import { getFamilyDetails, signOut } from "../lib";
import { formatDate, toTitleCase } from "../lib/strings";
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { useToast } from "../contexts/Toast";
import { useLocations } from "../contexts/Locations";

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
  const locations = useLocations();
  const [familyDetails, setFamilyDetails] = useState<FamilyDetails | null>(
    null,
  );

  useEffect(() => {
    const familyId = route.params.familyId;
    getFamilyDetails(familyId)
      .then(setFamilyDetails)
      .catch((e: Error) => toast.error(e.message));
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
        title={toTitleCase(familyDetails?.name ?? "Family Detail")}
        alignment="center"
        accessoryLeft={renderMenuActions}
      />
      <Divider />
      <Layout style={{ flex: 1 }}>
        <Text>{JSON.stringify(familyDetails)}</Text>
        {!!familyDetails?.joinedAt && (
          <Text>Joined {formatDate(new Date(familyDetails.joinedAt))}</Text>
        )}
        <Text>Members ({familyDetails?.members.length})</Text>
        {familyDetails?.members.map(({ firstName, lastName }) => (
          <Text>
            {firstName} {lastName}
          </Text>
        ))}
        {!!familyDetails && (
          <Button onPress={() => locations.setFamilyId(familyDetails.id)}>
            Select
          </Button>
        )}
        <Button
          onPress={() => {
            signOut();
            navigation.navigate("signin");
          }}
        >
          Sign Out
        </Button>
      </Layout>
    </SafeAreaView>
  );
}
