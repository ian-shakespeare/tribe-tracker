import {
  Button,
  Divider,
  Icon,
  IconProps,
  Layout,
  Select,
  SelectItem,
  Text,
} from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Family } from "../lib/models";
import { pb } from "../lib";
import { useNavigation } from "@react-navigation/native";
import { toTitleCase } from "../lib/strings";

function PlusIcon(props: IconProps) {
  return <Icon {...props} name="plus-outline" />;
}

export default function FamiliesScreen() {
  const navigation = useNavigation();
  const [families, setFamilies] = useState<Family[]>([]);

  useEffect(() => {
    // TODO: actually support pagination
    pb.collection<Family>("families")
      .getList()
      .then(({ items }) => setFamilies(items))
      .catch((e: Error) => console.error(e.name + ": " + e.message)); // TODO: toast this
  }, []);

  const handleNewFamily = () => {
    navigation.navigate("newfamily" as never);
  };

  return (
    <Layout style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}>
          <Text category="h1">Families</Text>
          <Divider style={{ marginVertical: 8 }} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Select disabled={families.length < 1} style={{ flex: 1 }}>
              {families.map((family, i) => (
                <SelectItem key={i} title={toTitleCase(family.name)} />
              ))}
            </Select>
            <Button accessoryRight={PlusIcon} onPress={handleNewFamily} />
          </View>
        </View>
        <Button
          onPress={() => {
            pb.authStore.clear();
            navigation.navigate("signin" as never);
          }}
        >
          Sign Out
        </Button>
      </SafeAreaView>
    </Layout>
  );
}
