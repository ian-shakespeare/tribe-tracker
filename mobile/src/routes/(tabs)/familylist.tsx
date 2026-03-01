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
import PlusIcon from "../../views/components/PlusIcon";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import PeopleIcon from "../../views/components/PeopleIcon";
import { useLiveQuery } from "../../db/liveQuery";
import { Family, getAllFamilies } from "../../models/family";
import { toTitleCase } from "../../utils/strings";

type ListItemProps = {
  item: Family;
  index: number;
};

export default function FamilyListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const query = useLiveQuery(getAllFamilies);

  const renderListItem = ({ item }: ListItemProps) => (
    <ListItem
      title={toTitleCase(item.name)}
      style={{ paddingHorizontal: 16 }}
      accessoryLeft={PeopleIcon}
      onPress={() =>
        router.push({
          pathname: "/familydetail",
          params: { familyId: item.id },
        })
      }
    />
  );

  const renderMenuActions = useCallback(
    () => (
      <TopNavigationAction
        icon={PlusIcon}
        onPress={() => router.push("/familynew")}
      />
    ),
    [router],
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
                onPress={() => router.push("/familynew")}
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
