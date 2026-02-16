import * as SecureStore from "expo-secure-store";
import PocketBase, { AsyncAuthStore } from "pocketbase";
import type { User } from "../models/user";
import { Family } from "../models/family";
import { Location } from "../models/locations";
import { FamilyMember } from "../models/familyMember";

const store = new AsyncAuthStore({
  save: async (serialized) => SecureStore.setItem("pb_auth", serialized),
  initial: SecureStore.getItem("pb_auth") ?? undefined,
});
const apiUrl = SecureStore.getItem("API_URL") ?? "";
const pb = new PocketBase(apiUrl, store);

export function getBaseUrl(): string {
  return pb.baseURL;
}

export function saveBaseUrl(url: URL) {
  pb.baseURL = url.toString();
  SecureStore.setItem("API_URL", url.toString());
}

export type ApiUser = Omit<User, "createdAt" | "updatedAt"> & {
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type NewApiUser = Omit<
  ApiUser,
  "id" | "createdAt" | "updatedAt" | "isDeleted"
> & { password: string; passwordConfirm: string };

export async function registerUser(
  user: NewApiUser,
): Promise<
  { success: true; user: ApiUser } | { success: false; error: Error }
> {
  try {
    if (user.password !== user.passwordConfirm) {
      throw new Error("passwords do not match");
    }

    const createdUser = await pb
      .collection<ApiUser>("users")
      .create({ ...user, emailVisibility: true });
    return { success: true, user: createdUser };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error };
    }

    return { success: false, error: new Error("Unknown error.") };
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<
  { success: true; user: ApiUser } | { success: false; error: Error }
> {
  try {
    const { record: user } = await pb
      .collection<ApiUser>("users")
      .authWithPassword(email, password);

    return { success: true, user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error };
    }

    return { success: false, error: new Error("Unknown error.") };
  }
}

export function signOut() {
  pb.authStore.clear();
}

export function isSignedIn(): boolean {
  return pb.authStore.isValid;
}

export async function refreshAuth() {
  await pb.collection("users").authRefresh();
}

export function getAvatarUri(avatar: string): string {
  const user = pb.authStore.record?.id;
  if (!user) {
    throw new Error("Not authorized.");
  }

  return `${getBaseUrl()}api/files/users/${user}/${avatar}`;
}

export async function updateMe(
  fields: Partial<Omit<User, "id" | "created" | "updated" | "email">>,
): Promise<ApiUser> {
  const user = pb.authStore.record?.id;
  if (!user) {
    throw new Error("Not authorized.");
  }

  const data = new FormData();
  if (fields.firstName) {
    data.append("firstName", fields.firstName.trim().toLowerCase());
  }

  if (fields.lastName) {
    data.append("lastName", fields.lastName.trim().toLowerCase());
  }

  if (fields.avatar) {
    data.append("avatar", {
      uri: fields.avatar,
      type: "image/*",
      name: fields.avatar.split("/").pop(),
    } as any);
  }

  return await pb.collection("users").update<ApiUser>(user, data);
}

export type ApiFamily = Omit<Family, "createdAt" | "updatedAt"> & {
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type NewApiFamily = Omit<
  ApiFamily,
  "id" | "createdBy" | "createdAt" | "updatedAt" | "isDeleted"
> & {
  code: string;
};

export type ApiFamilyMember = Omit<FamilyMember, "createdAt"> & {
  createdAt: string;
};

type CreateFamilyResponse = {
  family: ApiFamily;
  familyMember: ApiFamilyMember;
};

export async function createFamily(
  family: NewApiFamily,
): Promise<
  | { success: true; res: CreateFamilyResponse }
  | { success: false; error: Error }
> {
  try {
    const res = await pb.send<CreateFamilyResponse>(`/mobile/families`, {
      method: "POST",
      body: family,
    });
    return { success: true, res };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error };
    }

    return { success: false, error: new Error("Unknown error.") };
  }
}

type ApiLocation = Omit<Location, "createdAt"> & {
  createdAt: string;
};

type SyncResponse = {
  users: ApiUser[];
  families: ApiFamily[];
  familyMembers: ApiFamilyMember[];
  locations: ApiLocation[];
};

export async function getSyncData(after: Date): Promise<SyncResponse> {
  return await pb.send<SyncResponse>(`/mobile/sync`, {
    method: "GET",
    query: { after: after.toISOString() },
  });
}

export async function createLocation(
  lat: number,
  lon: number,
): Promise<
  { success: true; location: ApiLocation } | { success: false; error: Error }
> {
  const user = pb.authStore.record?.id;
  try {
    if (!user) {
      throw new Error("Not authorized.");
    }

    const created = await pb.collection<ApiLocation>("locations").create({
      user,
      coordinates: { lat, lon },
    });

    return { success: true, location: created };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error };
    } else {
      return { success: false, error: new Error("Unknown error.") };
    }
  }
}
