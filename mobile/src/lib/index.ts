import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import PocketBase, { AsyncAuthStore } from "pocketbase";
import { API_URL_KEY } from "./constants";
import {
  Family,
  FamilyDetails,
  FamilyMember,
  Invitation,
  MemberLocation,
  NewUser,
  User,
} from "./models";

const store = new AsyncAuthStore({
  save: async (serialized) => SecureStore.setItem("pb_auth", serialized),
  initial: SecureStore.getItem("pb_auth") ?? undefined,
});

const apiUrl = SecureStore.getItem(API_URL_KEY) ?? "";

const pb = new PocketBase(apiUrl, store);

export function isSignedIn(): boolean {
  return pb.authStore.isValid;
}

export async function createUser(user: NewUser): Promise<User> {
  if (user.password !== user.passwordConfirm) {
    throw new Error("Passwords do not match.");
  }

  return await pb.collection<User>("users").create(user);
}

export async function signIn(email: string, password: string) {
  await pb.collection("users").authWithPassword(email, password);
}

export function signOut() {
  pb.authStore.clear();
}

export async function refreshAuth() {
  await pb.collection("users").authRefresh();
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

  return await pb
    .collection<Family>("families")
    .create({ name, code, createdBy: user, members: [user] });
}

export async function getFamilies(): Promise<Family[]> {
  const results = await pb.collection<Family>("families").getList();
  return results.items;
}

export async function getFamilyDetails(
  familyId: string,
): Promise<FamilyDetails> {
  const user = pb.authStore.record?.id;

  if (!user) throw new Error("Not authorized.");

  const family = await pb.collection<Family>("families").getOne(familyId);

  const [{ updatedAt: joinedAt }, members] = await Promise.all([
    family.createdBy === user
      ? Promise.resolve({ updatedAt: family.createdAt })
      : pb
          .collection<Invitation>("invitations")
          .getFirstListItem(`recipient="${user}" && family="${family.id}"`),
    pb.send<FamilyMember[]>(`/mobile/families/${family.id}/members`, {
      method: "GET",
    }),
  ]);

  return { ...family, members, joinedAt };
}

export async function getUserLocations(
  familyId: string,
): Promise<MemberLocation[]> {
  const locations = await pb.send<MemberLocation[]>(
    `/mobile/families/${familyId}/members/locations`,
    {},
  );

  return locations;
}
