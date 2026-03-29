import {
  Button,
  Divider,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import BackArrowIcon from "../views/components/BackArrowIcon";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useLiveQuery } from "../db/liveQuery";
import { getFamily } from "../models/family";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import CopyIcon from "../views/components/CopyIcon";
import { useToast } from "../views/contexts/Toast";

export default function FamilyInviteScreen() {
  const router = useRouter();
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const toast = useToast();
  const theme = useTheme();
  const query = useLiveQuery(() => getFamily(familyId));

  const renderBackAction = () => (
    <TopNavigationAction icon={BackArrowIcon} onPress={() => router.back()} />
  );

  const handleCopyCode = async () => {
    if (query.isLoading || !query.result) {
      return;
    }

    await Clipboard.setStringAsync(query.result.id);
    toast.info("Copied!");
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation
        title="Invite Family Member"
        alignment="center"
        accessoryLeft={renderBackAction}
      />
      <Divider />
      <Layout style={styles.layout}>
        {query.isLoading ? (
          <Text category="p1" appearance="hint" style={styles.text}>
            Loading...
          </Text>
        ) : !query.result ? (
          <Text category="p1" appearance="hint" style={styles.text}>
            No Family Found
          </Text>
        ) : (
          <View style={styles.container}>
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <QRCode value={query.result.id} size={200} />
            </View>
            <Text appearance="hint" category="s2">
              Scan the QR or share the code.
            </Text>
            <Button
              appearance="outline"
              accessoryRight={CopyIcon}
              onPress={handleCopyCode}
            >
              {query.result.id}
            </Button>
          </View>
        )}
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
    paddingVertical: 24,
    alignItems: "center",
    gap: 12,
  },
  text: {
    textAlign: "center",
  },
});
