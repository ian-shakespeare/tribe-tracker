import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import * as API from "../../controllers/api";
import { deleteUsers, upsertUsers } from "../../models/user";
import { deleteFamilies, upsertFamilies } from "../../models/family";
import { createLocations } from "../../models/locations";

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
  if (!API.isSignedIn()) {
    console.log("not signed in");
    return;
  }

  console.log("getting sync data");
  const { users, families, locations } = await API.getSyncData(lastSyncedAt);
  console.log("got sync data");

  const { updatedUsers, deletedUserIDs } = users.reduce<{
    updatedUsers: API.ApiUser[];
    deletedUserIDs: string[];
  }>(
    ({ updatedUsers, deletedUserIDs }, curr) =>
      curr.isDeleted
        ? { updatedUsers, deletedUserIDs: [...deletedUserIDs, curr.id] }
        : { deletedUserIDs, updatedUsers: [...updatedUsers, curr] },
    { updatedUsers: [], deletedUserIDs: [] },
  );

  await deleteUsers(deletedUserIDs);
  await upsertUsers(
    updatedUsers.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.createdAt),
    })),
  );

  const { updatedFamilies, deletedFamilyIDs } = families.reduce<{
    updatedFamilies: API.ApiFamily[];
    deletedFamilyIDs: string[];
  }>(
    ({ updatedFamilies, deletedFamilyIDs }, curr) =>
      curr.isDeleted
        ? {
            updatedFamilies,
            deletedFamilyIDs: [...deletedFamilyIDs, curr.id],
          }
        : {
            deletedFamilyIDs,
            updatedFamilies: [...updatedFamilies, curr],
          },
    { updatedFamilies: [], deletedFamilyIDs: [] },
  );

  await deleteFamilies(deletedFamilyIDs);
  await upsertFamilies(
    updatedFamilies.map((family) => ({
      ...family,
      createdAt: new Date(family.createdAt),
      updatedAt: new Date(family.updatedAt),
    })),
  );

  await createLocations(
    locations.map((location) => ({
      ...location,
      createdAt: new Date(location.createdAt),
    })),
  );
}

const storedLastSyncedAt = new Date(SecureStore.getItem("LAST_SYNCED_AT") ?? 0);

export const SyncProvider = ({ children }: SyncProviderProps) => {
  const [lastSyncedAt, setLastSyncedAt] = useState(storedLastSyncedAt);

  const updateLastSyncedAt = (d: Date) => {
    setLastSyncedAt(d);
    SecureStore.setItem("LAST_SYNCED_AT", d.toISOString());
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
