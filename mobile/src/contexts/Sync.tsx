import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { db, getSyncData, isSignedIn } from "../lib";
import { familiesTable, locationsTable, usersTable } from "../db/schema";
import { RemoteFamily, User } from "../lib/models";
import { inArray, sql } from "drizzle-orm";
import * as SecureStore from "expo-secure-store";
import { LAST_SYNC_KEY } from "../lib/constants";

const SyncContext = createContext<{
  lastSyncedAt: Date;
  sync: () => Promise<void>;
}>({
  lastSyncedAt: new Date(0),
  sync: () => {
    throw new Error("Uninitialized.");
  },
});

export const useSync = () => useContext(SyncContext);

type SyncProviderProps = {
  children: ReactNode;
};

async function sync(lastSyncedAt: Date) {
  console.log("sync");
  if (!isSignedIn()) {
    console.log("not signed in");
    return;
  }

  console.log("getting sync data");
  const { users, families, locations } = await getSyncData(lastSyncedAt);
  console.log("got sync data");

  const { updatedUsers, deletedUsers } = users.reduce<{
    updatedUsers: User[];
    deletedUsers: User[];
  }>(
    ({ updatedUsers, deletedUsers }, curr) =>
      curr.isDeleted
        ? { updatedUsers, deletedUsers: [...deletedUsers, curr] }
        : { deletedUsers, updatedUsers: [...updatedUsers, curr] },
    { updatedUsers: [], deletedUsers: [] },
  );

  await db.delete(usersTable).where(
    inArray(
      usersTable.id,
      deletedUsers.map(({ id }) => id),
    ),
  );

  await db
    .insert(usersTable)
    .values(updatedUsers)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        email: sql`email`,
        firstName: sql`firstName`,
        lastName: sql`lastName`,
        avatar: sql`avatar`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
    });

  const { updatedFamilies, deletedFamilies } = families.reduce<{
    updatedFamilies: RemoteFamily[];
    deletedFamilies: RemoteFamily[];
  }>(
    ({ updatedFamilies, deletedFamilies }, curr) =>
      curr.isDeleted
        ? {
            updatedFamilies,
            deletedFamilies: [...deletedFamilies, curr],
          }
        : {
            deletedFamilies,
            updatedFamilies: [...updatedFamilies, curr],
          },
    { updatedFamilies: [], deletedFamilies: [] },
  );

  await db.delete(familiesTable).where(
    inArray(
      familiesTable.id,
      deletedFamilies.map(({ id }) => id),
    ),
  );

  await db
    .insert(familiesTable)
    .values(updatedFamilies)
    .onConflictDoUpdate({
      target: familiesTable.id,
      set: { name: sql`name`, createdBy: sql`createdBy` },
    });

  await db.insert(locationsTable).values(locations);
}

const storedLastSyncedAt = new Date(SecureStore.getItem(LAST_SYNC_KEY) ?? 0);

export const SyncProvider = ({ children }: SyncProviderProps) => {
  const [lastSyncedAt, setLastSyncedAt] = useState(storedLastSyncedAt);

  const updateLastSyncedAt = (d: Date) => {
    setLastSyncedAt(d);
    SecureStore.setItem(LAST_SYNC_KEY, d.toISOString());
  };

  useEffect(() => {
    sync(storedLastSyncedAt).then(() => updateLastSyncedAt(new Date()));
  }, [setLastSyncedAt]);

  return (
    <SyncContext.Provider
      value={{
        lastSyncedAt,
        sync: () =>
          sync(lastSyncedAt).then(() => updateLastSyncedAt(new Date())),
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};
