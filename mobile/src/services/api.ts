import * as SecureStore from "expo-secure-store";
import { User } from "../models/user";
import { Family } from "../models/family";
import { FamilyMember } from "../models/familyMember";
import { Location } from "../models/locations";

const UNAUTHORIZED = "unauthorized";
const REFRESH_TOKEN = "REFRESH_TOKEN";
const STORE_OPTIONS = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

type Access = {
  accessToken: string;
  expiry: Date;
  refreshToken: string;
};

type ApiAccess = Omit<Access, "expiry"> & { expiry: string };

export type ApiUser = Omit<User, "createdAt" | "updatedAt"> & {
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiFamily = Omit<Family, "createdAt" | "updatedAt"> & {
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiFamilyMember = Omit<FamilyMember, "createdAt"> & {
  createdAt: string;
};

export type ApiLocation = Omit<Location, "createdAt"> & {
  createdAt: string;
};

export type SyncData = {
  users: ApiUser[];
  families: ApiFamily[];
  familyMembers: ApiFamilyMember[];
  locations: ApiLocation[];
};

class API {
  access: Access;
  private url: URL | null = null;

  constructor() {
    try {
      this.access = {
        accessToken: "",
        expiry: new Date(0),
        refreshToken: SecureStore.getItem(REFRESH_TOKEN, STORE_OPTIONS) ?? "",
      };

      const baseUrl = SecureStore.getItem("API_URL", STORE_OPTIONS);
      if (baseUrl) {
        this.url = new URL(baseUrl);
      }
    } catch {
      // provided URL is invalid
      this.access = {
        accessToken: "",
        expiry: new Date(0),
        refreshToken: "",
      };
    }
  }

  get baseUrl(): URL | null {
    return this.url;
  }

  set baseUrl(url: URL) {
    this.url = url;
    SecureStore.setItem("API_URL", url.href, STORE_OPTIONS);
  }

  get isAuthenticated(): boolean {
    return !!this.access.refreshToken;
  }

  signOut() {
    SecureStore.setItem(REFRESH_TOKEN, "", STORE_OPTIONS);
    this.access.accessToken = "";
    this.access.expiry = new Date(0);
    this.access.refreshToken = "";
  }

  async healthy(): Promise<{ ok: true } | { ok: false; error: Error }> {
    return await this.makeRequest("GET", "/api/health", null, false);
  }

  async registerUser(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    passwordConfirm: string,
  ): Promise<{ ok: true } | { ok: false; error: Error }> {
    const res = await this.makeRequest<ApiAccess>(
      "POST",
      "/api/auth/register",
      JSON.stringify({
        email,
        firstName,
        lastName,
        password,
        passwordConfirm,
      }),
      false,
    );

    if (!res.ok) {
      return res;
    }

    SecureStore.setItem(REFRESH_TOKEN, res.data.refreshToken, STORE_OPTIONS);
    this.access.accessToken = res.data.accessToken;
    this.access.refreshToken = res.data.refreshToken;
    this.access.expiry = new Date(res.data.expiry);

    return res;
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ ok: true } | { ok: false; error: Error }> {
    const res = await this.makeRequest<ApiAccess>(
      "POST",
      "/api/auth/sign-in",
      JSON.stringify({
        email,
        password,
      }),
      false,
    );

    if (!res.ok) {
      return res;
    }

    SecureStore.setItem(REFRESH_TOKEN, res.data.refreshToken, STORE_OPTIONS);
    this.access.accessToken = res.data.accessToken;
    this.access.refreshToken = res.data.refreshToken;
    this.access.expiry = new Date(res.data.expiry);

    return res;
  }

  async refresh(): Promise<{ ok: true } | { ok: false; error: Error }> {
    const res = await this.makeRequest<ApiAccess>(
      "POST",
      "/api/auth/refresh",
      JSON.stringify({ refreshToken: this.access.refreshToken }),
      false,
    );

    if (!res.ok) {
      return res;
    }

    SecureStore.setItem(REFRESH_TOKEN, res.data.refreshToken, STORE_OPTIONS);
    this.access.accessToken = res.data.accessToken;
    this.access.refreshToken = res.data.refreshToken;
    this.access.expiry = new Date(res.data.expiry);

    return res;
  }

  async getSyncData(
    after: Date,
  ): Promise<{ ok: true; data: SyncData } | { ok: false; error: Error }> {
    return await this.makeRequest<SyncData>("GET", "/api/sync", null, true, {
      after: after.toISOString(),
    });
  }

  async createFamily(
    name: string,
  ): Promise<{ ok: true; family: ApiFamily } | { ok: false; error: Error }> {
    const res = await this.makeRequest<ApiFamily>(
      "POST",
      "/api/families",
      JSON.stringify({ name }),
      true,
    );

    if (!res.ok) {
      return res;
    }

    return { ok: true, family: res.data };
  }

  async getFamily(
    familyId: string,
  ): Promise<{ ok: true; family: ApiFamily } | { ok: false; error: Error }> {
    const res = await this.makeRequest<ApiFamily>(
      "GET",
      `/api/families/${familyId}`,
      null,
      true,
    );

    if (!res.ok) {
      return res;
    }

    return { ok: true, family: res.data };
  }

  async joinFamily(
    familyId: string,
  ): Promise<
    { ok: true; familyMember: ApiFamilyMember } | { ok: false; error: Error }
  > {
    const res = await this.makeRequest<ApiFamilyMember>(
      "POST",
      `/api/families/${familyId}/members`,
      null,
      true,
    );

    if (!res.ok) {
      return res;
    }

    return { ok: true, familyMember: res.data };
  }

  async getFamilyMembers(
    familyId: string,
  ): Promise<
    { ok: true; familyMembers: ApiFamilyMember[] } | { ok: false; error: Error }
  > {
    const res = await this.makeRequest<ApiFamilyMember[]>(
      "GET",
      `/api/families/${familyId}/members`,
      null,
      true,
    );

    if (!res.ok) {
      return res;
    }

    return { ok: true, familyMembers: res.data };
  }

  async getFamilyMemberLocations(
    familyId: string,
  ): Promise<
    { ok: true; locations: ApiLocation[] } | { ok: false; error: Error }
  > {
    const res = await this.makeRequest<ApiLocation[]>(
      "GET",
      `/api/families/${familyId}/members/locations`,
      null,
      true,
    );

    if (!res.ok) {
      return res;
    }

    return { ok: true, locations: res.data };
  }

  async getMe(): Promise<
    { ok: true; user: ApiUser } | { ok: false; error: Error }
  > {
    const res = await this.makeRequest<ApiUser>(
      "GET",
      "/api/users/me",
      null,
      true,
    );

    if (!res.ok) {
      return res;
    }

    return { ok: true, user: res.data };
  }

  async updateMe({
    firstName,
    lastName,
    avatar,
  }: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<{ ok: true; user: ApiUser } | { ok: false; error: Error }> {
    const res = await this.makeRequest<ApiUser>(
      "PATCH",
      "/api/users/me",
      JSON.stringify({
        firstName,
        lastName,
        avatar,
      }),
      true,
    );

    if (!res.ok) {
      return res;
    }

    return { ok: true, user: res.data };
  }

  async createLocation(
    lat: number,
    lon: number,
  ): Promise<
    { ok: true; location: ApiLocation } | { ok: false; error: Error }
  > {
    const res = await this.makeRequest<ApiLocation>(
      "POST",
      "/api/locations",
      JSON.stringify({
        lat,
        lon,
      }),
      true,
    );

    if (!res.ok) {
      return res;
    }

    return { ok: true, location: res.data };
  }

  async uploadMedia(
    fileUri: string,
  ): Promise<{ ok: true; url: string } | { ok: false; error: Error }> {
    const form = new FormData();
    form.append("file", {
      uri: fileUri,
      type: "image/*",
      name: fileUri.split("/").pop(),
    } as any);

    const res = await this.makeRequest<{ id: string }>(
      "POST",
      "/api/media",
      form,
      true,
    );
    if (!res.ok) {
      return res;
    }

    const url = new URL(this.baseUrl!.href);
    url.pathname = `/api/media/${res.data.id}`;
    return { ok: true, url: url.href };
  }

  private async makeRequest<T>(
    method: string,
    path: string,
    body: BodyInit | null,
    authorize: boolean,
    query?: Record<string, string>,
  ): Promise<{ ok: true; data: T } | { ok: false; error: Error }> {
    if (!this.baseUrl) {
      return { ok: false, error: new Error("No remote URL.") };
    }

    try {
      const url = new URL(this.baseUrl.href);
      url.pathname = path;
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          url.searchParams.set(k, v);
        });
      }

      const res = await fetch(url, {
        method,
        headers: !authorize
          ? undefined
          : {
              authorization: `Bearer ${this.access.accessToken}`,
            },
        body,
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message, {
          cause: res.status !== 401 ? null : UNAUTHORIZED,
        });
      }

      const data: T = await res.json();
      return { ok: true, data };
    } catch (error) {
      if (error instanceof Error) {
        if (authorize && error.cause === UNAUTHORIZED) {
          const res = await this.refresh();
          if (res.ok) {
            return this.makeRequest(method, path, body, authorize);
          }
        }

        return { ok: false, error };
      }

      return { ok: false, error: new Error("An unknown error occurred.") };
    }
  }
}

const api = new API();
export default api;
