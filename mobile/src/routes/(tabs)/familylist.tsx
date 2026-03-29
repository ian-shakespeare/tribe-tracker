import {
  Button,
  Card,
  Divider,
  Layout,
  List,
  ListItem,
  Modal,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { useCallback, useState } from "react";
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
  const [isModalVisible, setIsModalVisible] = useState(false);

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
        onPress={() => setIsModalVisible(true)}
      />
    ),
    [setIsModalVisible],
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
      <Modal
        visible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
      >
        <Card>
          <View
            style={{
              justifyContent: "center",
              paddingVertical: 8,
              gap: 8,
            }}
          >
            <Button
              onPress={() => {
                setIsModalVisible(false);
                router.push("/familyjoin");
              }}
              size="giant"
            >
              Join Existing Family
            </Button>
            <Text
              category="s1"
              appearance="hint"
              style={{ textAlign: "center", paddingBottom: 2 }}
            >
              - or -
            </Text>
            <Button
              appearance="outline"
              onPress={() => {
                setIsModalVisible(false);
                router.push("/familynew");
              }}
              size="giant"
              status="basic"
            >
              Create A New One
            </Button>
          </View>
        </Card>
      </Modal>
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
  modalDivider: {
    marginVertical: 6,
  },
});
