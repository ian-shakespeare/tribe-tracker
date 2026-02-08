import {
  Button,
  Divider,
  Input,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { useToast } from "../contexts/Toast";
import * as API from "../../controllers/api";
import { createFamily } from "../../models/family";
import * as Crypto from "expo-crypto";
import { createFamilyMember } from "../../models/familyMember";

type FamilyNewScreenProps = NativeStackScreenProps<StackParamList, "familynew">;

export default function FamilyNewScreen({ navigation }: FamilyNewScreenProps) {
  const theme = useTheme();
  const toast = useToast();
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    const res = await API.createFamily({
      name,
      code: Crypto.randomUUID().replaceAll("-", ""),
    });
    if (!res.success) {
      toast.danger(res.error.message);
      return;
    }

    const { family, familyMember } = res.res;

    const created = await createFamily({
      ...family,
      createdAt: new Date(family.createdAt),
      updatedAt: new Date(family.updatedAt),
    });
    if (!created.success) {
      toast.danger(created.error.message);
      return;
    }

    const { success } = await createFamilyMember({
      ...familyMember,
      createdAt: new Date(familyMember.createdAt),
    });
    if (!success) {
      toast.danger("Failed to create local family member.");
    }

    navigation.replace("familydetail", { familyId: created.family.id });
  };

  const renderMenuActions = useCallback(
    () => (
      <TopNavigationAction
        icon={BackArrowIcon}
        onPress={() => navigation.pop()}
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation
        title="New Family"
        alignment="center"
        accessoryLeft={renderMenuActions}
      />
      <Divider />
      <Layout style={styles.layout}>
        <View style={styles.container}>
          <View style={styles.input}>
            <Input placeholder="Name" value={name} onChangeText={setName} />
            <Text category="p2" appearance="hint" style={styles.text}>
              Something like &quot;Smiths&quot;, &quot;Kevin&apos;s Cool
              Kids&quot;, etc.
            </Text>
          </View>
          <Button onPress={handleSubmit}>Create</Button>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  container: {
    flex: 1,
    gap: 12,
    justifyContent: "space-between",
  },
  input: {
    gap: 4,
  },
  text: {
    textAlign: "center",
  },
});
