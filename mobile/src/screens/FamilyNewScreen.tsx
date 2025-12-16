import {
  Button,
  Divider,
  Input,
  Layout,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pb } from "../lib";
import * as Crypto from "expo-crypto";
import BackArrowIcon from "../components/BackArrowIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";

type FamilyNewScreenProps = NativeStackScreenProps<StackParamList, "familynew">;

export default function FamilyNewScreen({ navigation }: FamilyNewScreenProps) {
  const theme = useTheme();
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const code = Crypto.randomUUID().replaceAll("-", "");
    const user = pb.authStore.record?.id;

    if (!user) {
      // TODO: toast this bitch
      console.error("no user??");
      return;
    }

    pb.collection("families")
      .create({
        name,
        code,
        createdBy: user,
        members: user,
      })
      .then(({ id }) => navigation.replace("familydetail", { familyId: id }))
      .catch(console.error); // TODO: toast
  };

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
      style={{ flex: 1, backgroundColor: theme["background-basic-color-1"] }}
    >
      <TopNavigation
        title="New Family"
        alignment="center"
        accessoryLeft={renderMenuActions}
      />
      <Divider />
      <Layout style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}>
          <Input placeholder="Name" value={name} onChangeText={setName} />
          <Button onPress={handleSubmit}>Create</Button>
        </View>
      </Layout>
    </SafeAreaView>
  );
}
