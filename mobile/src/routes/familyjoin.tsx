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
import BackArrowIcon from "../views/components/BackArrowIcon";
import { useRouter } from "expo-router";
import { useToast } from "../views/contexts/Toast";
import api from "../services/api";
import { useSync } from "../views/contexts/Sync";

export default function FamilyJoinScreen() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  const { resetSync, sync } = useSync();
  const [familyId, setFamilyId] = useState("");

  const handleSubmit = async () => {
    const joinRes = await api.joinFamily(familyId);
    if (!joinRes.ok) {
      toast.danger("Failed to join family: " + joinRes.error.message);
      return;
    }

    await resetSync();
    await sync();

    router.replace({
      pathname: "/familydetail",
      params: { familyId: joinRes.familyMember.family },
    });
  };

  const renderMenuActions = useCallback(
    () => (
      <TopNavigationAction icon={BackArrowIcon} onPress={() => router.back()} />
    ),
    [router],
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation
        title="Join Family"
        alignment="center"
        accessoryLeft={renderMenuActions}
      />
      <Divider />
      <Layout style={styles.layout}>
        <View style={styles.container}>
          <View style={styles.input}>
            <Input
              placeholder="Code"
              value={familyId}
              onChangeText={setFamilyId}
            />
            <Text category="p2" appearance="hint" style={styles.text}>
              A series of random digits in the format
              00000000-0000-0000-0000-000000000000.
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
