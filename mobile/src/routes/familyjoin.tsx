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
import QRScanner from "../views/components/QRScanner";

export default function FamilyJoinScreen() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  const { resetSync, sync } = useSync();
  const [familyCode, setFamilyCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (familyId: string) => {
    setIsSubmitting(true);

    const joinRes = await api.joinFamily(familyId);
    if (!joinRes.ok) {
      setIsSubmitting(false);
      toast.danger("Failed to join family: " + joinRes.error.message);
      return;
    }

    await resetSync();
    await sync();

    setIsSubmitting(false);
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
        <QRScanner
          onScan={(code) => {
            setFamilyCode(code);
            handleSubmit(code.trim());
          }}
        />
        <Text category="s1" appearance="hint" style={styles.text}>
          - or -
        </Text>
        <View style={styles.container}>
          <View style={styles.input}>
            <Input
              placeholder="Enter Code"
              value={familyCode}
              onChangeText={setFamilyCode}
            />
            <Text category="p2" appearance="hint" style={styles.text}>
              A series of random characters in the format
              &quot;00000000-0000-0000-0000-000000000000&quot;
            </Text>
          </View>
          <Button
            onPress={() => handleSubmit(familyCode.trim())}
            disabled={isSubmitting}
          >
            {!isSubmitting ? "Join" : "Joining..."}
          </Button>
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
    gap: 12,
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
