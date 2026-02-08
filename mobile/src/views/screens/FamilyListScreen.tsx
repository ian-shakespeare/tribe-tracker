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
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import PlusIcon from "../components/PlusIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import PeopleIcon from "../components/PeopleIcon";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useLiveQuery } from "../../db/liveQuery";
import { Family, getAllFamilies } from "../../models/family";
import { toTitleCase } from "../../utils/strings";

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
  const query = useLiveQuery(getAllFamilies);

  const renderSwipeAction = () => (
    <View style={{ flexDirection: "row" }}>
      <Pressable
        onPress={() => console.log("TODO: select family")}
        style={({ pressed }) => ({
          backgroundColor: theme["color-primary-default"],
          paddingHorizontal: 16,
          justifyContent: "center",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text>Select</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          Alert.alert(
            "Leave Family",
            "You can't rejoin without an invitation.",
            [
              { text: "Cancel", onPress: () => {} },
              {
                text: "OK",
                onPress: () => console.log("TODO: leave family"),
                isPreferred: true,
              },
            ],
          )
        }
        style={({ pressed }) => ({
          backgroundColor: theme["color-danger-default"],
          paddingHorizontal: 16,
          justifyContent: "center",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text>Leave</Text>
      </Pressable>
    </View>
  );

  const renderListItem = ({ item }: ListItemProps) => (
    <Swipeable renderRightActions={renderSwipeAction}>
      <ListItem
        title={toTitleCase(item.name)}
        style={{ paddingHorizontal: 16 }}
        accessoryLeft={PeopleIcon}
        onPress={() => navigation.push("familydetail", { familyId: item.id })}
      />
    </Swipeable>
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
        styles.safeArea,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <TopNavigation
        title="Families"
        alignment="center"
        accessoryRight={renderMenuActions}
      />
      <Divider />
      <Layout style={styles.layout}>
        {query.isLoading ? (
          <Text>Loading</Text>
        ) : query.result.length < 1 ? (
          <View style={styles.container}>
            <Text category="h6" style={styles.text}>
              You don&apos;t have a family yet.{"\n"}But you can{" "}
              <Text
                category="h6"
                onPress={() => navigation.navigate("familynew")}
                style={[
                  styles.highlight,
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
            data={query.result}
            renderItem={renderListItem}
            ItemSeparatorComponent={Divider}
          />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    textAlign: "center",
    lineHeight: 24,
  },
  highlight: {
    textDecorationLine: "underline",
  },
});
