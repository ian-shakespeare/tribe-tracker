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
import { createFamilyMembers } from "../../models/familyMember";

const SyncContext = createContext<{
  lastSyncedAt: Date;
  sync: () => Promise<void>;
  resetSync: () => void;
}>({
  lastSyncedAt: new Date(0),
  sync: () => {
    throw new Error("Uninitialized.");
  },
  resetSync: () => {
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
    throw new Error("Not authenticated.");
  }

  console.log("getting sync data");
  const { users, families, familyMembers, locations } =
    await API.getSyncData(lastSyncedAt);
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

  await createFamilyMembers(
    familyMembers.map((familyMember) => ({
      ...familyMember,
      createdAt: new Date(familyMember.createdAt),
    })),
  );

  await createLocations(
    locations.map((location) => ({
      ...location,
      createdAt: new Date(location.createdAt),
    })),
  );
}

const storedLastSyncedAt = !SecureStore.getItem("LAST_SYNCED_AT")
  ? new Date(0)
  : new Date(SecureStore.getItem("LAST_SYNCED_AT")!);
export const SyncProvider = ({ children }: SyncProviderProps) => {
  const [lastSyncedAt, setLastSyncedAt] = useState(storedLastSyncedAt);

  const updateLastSyncedAt = (d: Date) => {
    setLastSyncedAt(d);
    SecureStore.setItem("LAST_SYNCED_AT", d.toISOString());
  };

  const resetSync = () => {
    setLastSyncedAt(new Date(0));
    SecureStore.setItem("LAST_SYNCED_AT", "");
  };

  useEffect(() => {
    sync(storedLastSyncedAt)
      .then(() => updateLastSyncedAt(new Date()))
      .catch(console.warn);
  }, [setLastSyncedAt]);

  return (
    <SyncContext.Provider
      value={{
        lastSyncedAt,
        resetSync,
        sync: () =>
          sync(lastSyncedAt).then(() => updateLastSyncedAt(new Date())),
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};
