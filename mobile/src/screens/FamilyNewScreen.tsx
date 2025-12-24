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
import { createFamily } from "../lib";
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { useToast } from "../contexts/Toast";

type FamilyNewScreenProps = NativeStackScreenProps<StackParamList, "familynew">;

export default function FamilyNewScreen({ navigation }: FamilyNewScreenProps) {
  const theme = useTheme();
  const toast = useToast();
  const [name, setName] = useState("");

  const handleSubmit = useCallback(
    () =>
      createFamily(name)
        .then(({ id }) => navigation.replace("familydetail", { familyId: id }))
        .catch((e: Error) => toast.danger(e.message)),
    [name, navigation, toast],
  );

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
              Something like "Smiths", "Kevin's Cool Kids", etc.
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
