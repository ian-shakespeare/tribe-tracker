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
import { getFamilies, leaveFamily } from "../lib";
import { toTitleCase } from "../lib/strings";
import PlusIcon from "../components/PlusIcon";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../AppNavigator";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useToast } from "../contexts/Toast";
import PeopleIcon from "../components/PeopleIcon";
import { useFocusEffect } from "@react-navigation/native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

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
        .catch((e: Error) => toast.danger(e.message));
    }, [setFamilies]),
  );

  const renderSwipeAction = (familyId: string) => (
    <Pressable
      onPress={() =>
        Alert.alert("Leave Family", "You can't rejoin without an invitation.", [
          { text: "Cancel", onPress: () => {} },
          {
            text: "OK",
            onPress: () =>
              leaveFamily(familyId)
                .then(() =>
                  setFamilies((prev) =>
                    prev.filter(({ id }) => id !== familyId),
                  ),
                )
                .catch((e: Error) => toast.danger(e.message)),
            isPreferred: true,
          },
        ])
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
  );

  const renderListItem = useCallback(
    ({ item }: ListItemProps) => (
      <Swipeable renderRightActions={() => renderSwipeAction(item.id)}>
        <ListItem
          title={toTitleCase(item.name)}
          style={{ paddingHorizontal: 16 }}
          accessoryLeft={PeopleIcon}
          onPress={() => navigation.push("familydetail", { familyId: item.id })}
        />
      </Swipeable>
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
        {families.length < 1 ? (
          <View style={styles.container}>
            <Text category="h6" style={styles.text}>
              You don't have a family yet.{"\n"}But you can{" "}
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
            data={families}
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
