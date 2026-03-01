import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import * as API from "../../controllers/api";
import * as Location from "expo-location";
import { deleteUsers, upsertUsers } from "../../models/user";
import { deleteFamilies, upsertFamilies } from "../../models/family";
import { upsertLocations } from "../../models/locations";
import { upsertFamilyMembers } from "../../models/familyMember";

const SyncContext = createContext<{
  lastSyncedAt: Date;
  sync: () => Promise<void>;
  resetSync: () => Promise<void>;
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

async function upsertAndDeleteRecentUsers(users: API.ApiUser[]) {
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
}

async function upsertAndDeleteFamilies(families: API.ApiFamily[]) {
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
}

async function getLocation(): Promise<Location.LocationObjectCoords | null> {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  if (!granted) {
    return null;
  }

  const lastKnownPos = await Location.getLastKnownPositionAsync();
  if (lastKnownPos) {
    return lastKnownPos.coords;
  }

  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.LocationAccuracy.Lowest,
  });
  return coords;
}

async function syncWithAPI(lastSyncedAt: Date) {
  if (!API.isSignedIn()) {
    throw new Error("Not authenticated.");
  }

  // One-shot foreground location push as a fallback.
  // Background task handles periodic updates; this ensures
  // fresh location data when the user actively opens the app.
  const coords = await getLocation();
  if (coords) {
    await API.createLocation(coords.latitude, coords.longitude).catch(() => {});
  }

  const { users, families, familyMembers, locations } =
    await API.getSyncData(lastSyncedAt);

  await upsertAndDeleteRecentUsers(users);
  await upsertAndDeleteFamilies(families);
  await upsertFamilyMembers(
    familyMembers.map((familyMember) => ({
      ...familyMember,
      createdAt: new Date(familyMember.createdAt),
    })),
  );
  await upsertLocations(
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

  const resetSync = async () => {
    setLastSyncedAt(new Date(0));
    SecureStore.deleteItemAsync("LAST_SYNCED_AT");
  };

  useEffect(() => {
    syncWithAPI(storedLastSyncedAt)
      .then(() => updateLastSyncedAt(new Date()))
      .catch(() => {
        /* ignore */
      });
  }, [setLastSyncedAt]);

  return (
    <SyncContext.Provider
      value={{
        lastSyncedAt,
        resetSync,
        sync: async () => {
          await syncWithAPI(lastSyncedAt);
          updateLastSyncedAt(new Date());
        },
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};
