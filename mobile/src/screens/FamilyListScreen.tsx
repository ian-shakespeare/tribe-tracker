import {
  Button,
  Divider,
  Icon,
  IconProps,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Family } from "../lib/models";
import { pb } from "../lib";
import { toTitleCase } from "../lib/strings";
import PlusIcon from "../components/PlusIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { View } from "react-native";

type ListItemProps = {
  item: Family;
  index: number;
};

type FamilyListScreenProps = NativeStackScreenProps<
  StackParamList,
  "familylist"
>;

export default function FamilyListScreen({
  navigation,
}: FamilyListScreenProps) {
  const theme = useTheme();
  const [families, setFamilies] = useState<Family[]>([]);

  useEffect(() => {
    // TODO: actually support pagination
    pb.collection<Family>("families")
      .getList()
      .then(({ items }) => setFamilies(items))
      .catch((e: Error) => console.error(e.name + ": " + e.message)); // TODO: toast this
  }, [navigation]);

  const renderIcon = (props: IconProps) => (
    <Icon {...props} name="people-outline" />
  );

  const renderItem = ({ item }: ListItemProps) => (
    <ListItem
      title={toTitleCase(item.name)}
      style={{ paddingHorizontal: 16 }}
      accessoryLeft={renderIcon}
      onPress={() => navigation.push("familydetail", { familyId: item.id })}
    />
  );

  const renderMenuActions = () => {
    return (
      <TopNavigationAction
        icon={PlusIcon}
        onPress={() => navigation.push("familynew")}
      />
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: theme["background-basic-color-1"] }}
    >
      <TopNavigation
        title="Families"
        alignment="center"
        accessoryRight={renderMenuActions}
      />
      <Divider />
      <Layout style={{ flex: 1 }}>
        {families.length < 1 ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Text>You don't have a family, jack ass</Text>
            <Button onPress={() => navigation.navigate("familynew")}>
              Create One
            </Button>
          </View>
        ) : (
          <List
            keyExtractor={({ id }) => String(id)}
            data={families}
            renderItem={renderItem}
          />
        )}
      </Layout>
    </SafeAreaView>
  );
}
