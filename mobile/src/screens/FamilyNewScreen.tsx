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

  const handleSubmit = () => {
    createFamily(name)
      .then(({ id }) => navigation.replace("familydetail", { familyId: id }))
      .catch((e: Error) => {
        console.error(e);
        toast.error(e.message);
      });
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
