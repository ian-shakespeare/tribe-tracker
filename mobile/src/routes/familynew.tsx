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
import { createFamily } from "../models/family";
import { createFamilyMember } from "../models/familyMember";
import api from "../services/api";

export default function FamilyNewScreen() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const familyRes = await api.createFamily(name);
      if (!familyRes.ok) {
        toast.danger(familyRes.error.message);
        return;
      }

      const joinRes = await api.joinFamily(familyRes.family.id);
      if (!joinRes.ok) {
        toast.danger("Failed to join family: " + joinRes.error.message);
        return;
      }

      const family = familyRes.family;
      const familyMember = joinRes.familyMember;

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

      router.replace({
        pathname: "/familydetail",
        params: { familyId: created.family.id },
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <Button disabled={isSubmitting} onPress={handleSubmit}>
            Create
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
