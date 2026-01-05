import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import PocketBase, { AsyncAuthStore } from "pocketbase";
import { API_URL_KEY } from "./constants";
import {
  Family,
  FamilyDetails,
  FamilyInvitation,
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

export async function getFamily(familyId: string): Promise<Family> {
  const user = pb.authStore.record?.id;
  if (!user) throw new Error("Not authorized.");

  return await pb.collection<Family>("families").getOne(familyId);
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

export async function leaveFamily(familyId: string) {
  const user = pb.authStore.record?.id;
  if (!user) throw new Error("Not authorized.");

  const family = await getFamily(familyId);

  await pb.collection("families").update(familyId, {
    members: family.members.filter((member) => member !== user),
  });
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

export async function createLocation(lat: number, lon: number) {
  const user = pb.authStore.record?.id;
  if (!user) throw new Error("Not authorized.");

  await pb.collection("locations").create({ user, coordinates: { lat, lon } });
}

export async function getUsers(ids: string[]): Promise<User[]> {
  const filter = ids.map((id) => `id = "${id}"`).join(" || ");
  const users = await pb.collection<User>("users").getList(0, 100, { filter });
  return users.items;
}

export async function getPendingInvitations(
  familyId: string,
): Promise<Invitation[]> {
  const invitations = await pb
    .collection<Invitation>("invitations")
    .getList(0, 100, { filter: `accepted=false && family="${familyId}"` });
  return invitations.items;
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

export async function getUser(userId: string): Promise<User> {
  const user = pb.authStore.record?.id;
  if (!user) {
    throw new Error("Not authorized.");
  }

  return await pb.collection<User>("users").getOne(userId);
}

export async function getMe(): Promise<User> {
  const user = pb.authStore.record?.id;
  if (!user) {
    throw new Error("Not authorized.");
  }

  return await pb.collection<User>("users").getOne(user);
}

export function getAvatarUri(avatar: string): string {
  const user = pb.authStore.record?.id;
  if (!user) {
    throw new Error("Not authorized.");
  }

  return `${getBaseUrl()}api/files/users/${user}/${avatar}`;
}

export async function getMyInvitations(): Promise<FamilyInvitation[]> {
  return await pb.send<FamilyInvitation[]>(`/mobile/invitations`, {
    method: "GET",
  });
}

export async function acceptInvitation(invitationId: string): Promise<string> {
  const { familyId } = await pb.send<{ familyId: string }>(
    `/mobile/invitations/${invitationId}`,
    {
      method: "PUT",
    },
  );

  return familyId;
}

export async function declineInvitation(invitationId: string) {
  await pb.collection("invitations").delete(invitationId);
}
