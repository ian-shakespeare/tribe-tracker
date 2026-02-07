import { useEffect } from "react";
import PlatformMap from "../components/PlatformMap";
import { toTitleCase } from "../lib/strings";
import { db } from "../lib";
import { useToast } from "../contexts/Toast";
import { StyleSheet } from "react-native";
import {
  Divider,
  Layout,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import RefreshIcon from "../components/RefreshIcon";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { locationsTable, usersTable } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export default function MapScreen() {
  const theme = useTheme();
  const toast = useToast();
  const { data, error } = useLiveQuery(
    db
      .select({
        coordinates: locationsTable.coordinates,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        recordedAt: sql<string>`max(${locationsTable.createdAt})`.mapWith(
          String,
        ),
      })
      .from(locationsTable)
      .innerJoin(usersTable, eq(locationsTable.user, usersTable.id))
      .groupBy(sql`${usersTable.id}`),
  );

  // TODO: post user location somewhere
  // TODO: render error

  const renderMenuActions = () => (
    <TopNavigationAction
      icon={RefreshIcon}
      onPress={() => console.log("TODO")}
    />
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
        title="TODO Baby!"
        alignment="center"
        accessoryRight={renderMenuActions}
      />
      <Divider />
      <Layout style={styles.layout}>
        <PlatformMap
          markers={data.map(({ firstName, lastName, coordinates }) => ({
            title: toTitleCase(`${firstName} ${lastName}`),
            coordinates: {
              latitude: (coordinates as { lat: number }).lat,
              longitude: (coordinates as { lon: number }).lon,
            },
          }))}
        />
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
  actionContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1,
    flexDirection: "row",
    gap: 6,
  },
  select: {
    flex: 1,
  },
});
