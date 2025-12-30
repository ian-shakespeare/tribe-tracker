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
import * as SecureStore from "expo-secure-store";
import { SELECTED_FAMILY_KEY } from "../lib/constants";
import StarIcon from "../components/StarIcon";

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
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);

  useFocusEffect(
    useCallback(() => {
      SecureStore.getItemAsync(SELECTED_FAMILY_KEY).then(setSelectedFamilyId);

      getFamilies()
        .then(setFamilies)
        .catch((e: Error) => toast.danger(e.message));
    }, [setFamilies]),
  );

  const handleSelectFamily = (familyId: string) => {
    SecureStore.setItem(SELECTED_FAMILY_KEY, familyId);
    setSelectedFamilyId(familyId);
  };

  const handleLeaveFamily = async (familyId: string) => {
    try {
      await leaveFamily(familyId);
      setFamilies((prev) => prev.filter(({ id }) => id !== familyId));
    } catch (e) {
      if (e instanceof Error) {
        toast.danger(e.message);
      }
    }
  };

  const renderSwipeAction = (familyId: string) => (
    <View style={{ flexDirection: "row" }}>
      <Pressable
        onPress={() => handleSelectFamily(familyId)}
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
                onPress: () => handleLeaveFamily(familyId),
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

  const renderListItem = useCallback(
    ({ item }: ListItemProps) => (
      <Swipeable renderRightActions={() => renderSwipeAction(item.id)}>
        <ListItem
          title={toTitleCase(item.name)}
          style={{ paddingHorizontal: 16 }}
          accessoryLeft={PeopleIcon}
          accessoryRight={item.id == selectedFamilyId ? StarIcon : undefined}
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
