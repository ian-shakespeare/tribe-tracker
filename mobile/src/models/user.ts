import type { Location } from "./locations";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserLocation = Pick<User, "firstName" | "lastName" | "avatar"> &
  Pick<Location, "id" | "lat" | "lon"> & { recordedAt: Date };
