import * as SecureStore from "expo-secure-store";
import PocketBase, { AsyncAuthStore } from "pocketbase";
import { API_URL_KEY } from "./constants";

const store = new AsyncAuthStore({
  save: async (serialized) => SecureStore.setItem("pb_auth", serialized),
  initial: SecureStore.getItem("pb_auth") ?? undefined,
});

const apiUrl = SecureStore.getItem(API_URL_KEY) ?? "";

export const pb = new PocketBase(apiUrl, store);
