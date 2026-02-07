import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import PocketBase, { AsyncAuthStore } from "pocketbase";
import { API_URL_KEY } from "./constants";
import {
  Family,
  FamilyMember,
  Invitation,
  NewUser,
  RemoteFamily,
  Location,
  RemoteUser,
  User,
} from "./models";
import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { familiesTable, familyMembersTable, usersTable } from "../db/schema";
import { sql } from "drizzle-orm";

const expoDb = openDatabaseSync("tribetracker.db");
export const db = drizzle(expoDb);

const store = new AsyncAuthStore({
  save: async (serialized) => SecureStore.setItem("pb_auth", serialized),
  initial: SecureStore.getItem("pb_auth") ?? undefined,
});

const apiUrl = SecureStore.getItem(API_URL_KEY) ?? "";

const pb = new PocketBase(apiUrl, store);

export function isSignedIn(): boolean {
  return pb.authStore.isValid;
}

type SyncResponse = {
  users: RemoteUser[];
  families: RemoteFamily[];
  locations: Location[];
};

export async function getSyncData(after: Date): Promise<SyncResponse> {
  console.log("getSyncData");
  const res = await pb.send<SyncResponse>(`/mobile/sync`, {
    method: "GET",
    query: { after: after.toISOString() },
  });

  console.log("sync data: " + JSON.stringify(res));

  return res;
}

export async function createUser(user: NewUser): Promise<User> {
  if (user.password !== user.passwordConfirm) {
    throw new Error("Passwords do not match.");
  }

  const remoteUser = await pb
    .collection<RemoteUser>("users")
    .create({ ...user, emailVisibility: true });

  const [created] = await db
    .insert(usersTable)
    .values({
      id: remoteUser.id,
      email: remoteUser.email,
      firstName: remoteUser.firstName,
      lastName: remoteUser.lastName,
      createdAt: remoteUser.createdAt,
      updatedAt: remoteUser.updatedAt,
    })
    .onConflictDoUpdate({
      target: [usersTable.id, usersTable.email],
      set: {
        firstName: sql`firstName`,
        lastName: sql`lastName`,
        createdAt: sql`createdAt`,
        updatedAt: sql`updatedAt`,
      },
    })
    .returning();

  return created;
}

export async function updateMe(
  fields: Partial<Omit<User, "id" | "created" | "updated" | "email">>,
): Promise<User> {
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

  return await pb.collection("users").update<User>(user, data);
}

export async function signIn(email: string, password: string) {
  const { record: remoteUser } = await pb
    .collection<RemoteUser>("users")
    .authWithPassword(email, password);

  const [created] = await db
    .insert(usersTable)
    .values({
      id: remoteUser.id,
      email: remoteUser.email,
      firstName: remoteUser.firstName,
      lastName: remoteUser.lastName,
      createdAt: remoteUser.createdAt,
      updatedAt: remoteUser.updatedAt,
    })
    .onConflictDoNothing({ target: [usersTable.id, usersTable.email] })
    .returning();

  return created;
}

export function signOut() {
  pb.authStore.clear();
}

export async function refreshAuth() {
  await pb.collection("users").authRefresh();
}

export function getMyUserId(): string {
  return pb.authStore.record?.id ?? "";
}

export function getBaseUrl(): string {
  return pb.baseURL;
}

export function saveBaseUrl(url: URL) {
  pb.baseURL = url.toString();
  SecureStore.setItem(API_URL_KEY, url.toString());
}

export async function createFamily(name: string): Promise<Family> {
  const user = pb.authStore.record?.id;
  if (!user) {
    throw new Error("Not authorized.");
  }

  const code = Crypto.randomUUID().replaceAll("-", "");

  const formData = new FormData();
  formData.append("name", name);
  formData.append("code", code);

  const { family: remoteFamily, familyMember: remoteFamilyMember } =
    await pb.send<{ family: RemoteFamily; familyMember: FamilyMember }>(
      "/mobile/families",
      {
        method: "POST",
        body: formData,
      },
    );

  const [[created]] = await Promise.all([
    db
      .insert(familiesTable)
      .values({
        id: remoteFamily.id,
        name: remoteFamily.name,
        createdBy: remoteFamily.createdBy,
        createdAt: remoteFamily.createdAt,
        updatedAt: remoteFamily.updatedAt,
      })
      .returning(),
    db.insert(familyMembersTable).values({
      id: remoteFamilyMember.id,
      family: remoteFamilyMember.family,
      user: remoteFamilyMember.user,
      createdAt: remoteFamilyMember.createdAt,
    }),
  ]);

  return created;
}

export async function getFamilies(): Promise<Family[]> {
  const results = await pb.collection<Family>("families").getList();
  return results.items;
}

export async function leaveFamily(familyId: string) {
  const user = pb.authStore.record?.id;
  if (!user) throw new Error("Not authorized.");

  throw new Error("TODO: leave family");
}

export async function createLocation(lat: number, lon: number) {
  const user = pb.authStore.record?.id;
  if (!user) throw new Error("Not authorized.");

  await pb.collection("locations").create({ user, coordinates: { lat, lon } });
}

export async function createInvitation(
  familyId: string,
  email: string,
): Promise<Invitation> {
  const sender = pb.authStore.record?.id;
  if (!sender) throw new Error("Not authorized.");

  const { id: recipient } = await pb
    .collection<User>("users")
    .getFirstListItem(`email="${email}"`);

  return await pb
    .collection<Invitation>("invitations")
    .create({ sender, recipient, family: familyId });
}

export function getAvatarUri(avatar: string): string {
  const user = pb.authStore.record?.id;
  if (!user) {
    throw new Error("Not authorized.");
  }

  return `${getBaseUrl()}api/files/users/${user}/${avatar}`;
}
