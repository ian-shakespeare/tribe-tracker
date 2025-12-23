import {
  Divider,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Family } from "../lib/models";
import { getFamilies } from "../lib";
import { toTitleCase } from "../lib/strings";
import PlusIcon from "../components/PlusIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { StyleSheet, View } from "react-native";
import { useToast } from "../contexts/Toast";
import PeopleIcon from "../components/PeopleIcon";
import { useFocusEffect } from "@react-navigation/native";

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
  const toast = useToast();
  const [families, setFamilies] = useState<Family[]>([]);

  useFocusEffect(
    useCallback(() => {
      getFamilies()
        .then(setFamilies)
        .catch((e: Error) => toast.error(e.message));
    }, [setFamilies]),
  );

  const renderListItem = useCallback(
    ({ item }: ListItemProps) => (
      <ListItem
        title={toTitleCase(item.name)}
        style={{ paddingHorizontal: 16 }}
        accessoryLeft={PeopleIcon}
        onPress={() => navigation.push("familydetail", { familyId: item.id })}
      />
    ),
    [navigation],
  );

  const renderMenuActions = useCallback(
    () => (
      <TopNavigationAction
        icon={PlusIcon}
        onPress={() => navigation.push("familynew")}
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.screen,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation
        title="Families"
        alignment="center"
        accessoryRight={renderMenuActions}
      />
      <Divider />
      <Layout style={styles.screen}>
        {families.length < 1 ? (
          <View style={styles.textContainer}>
            <Text category="h6" style={styles.text}>
              You don't have a family yet.{"\n"}But you can{" "}
              <Text
                category="h6"
                onPress={() => navigation.navigate("familynew")}
                style={[
                  styles.selectableText,
                  {
                    color: theme["text-primary-color"],
                  },
                ]}
              >
                create one.
              </Text>
            </Text>
          </View>
        ) : (
          <List
            keyExtractor={({ id }) => String(id)}
            data={families}
            renderItem={renderListItem}
          />
        )}
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    textAlign: "center",
    lineHeight: 24,
  },
  selectableText: {
    textDecorationLine: "underline",
  },
});
