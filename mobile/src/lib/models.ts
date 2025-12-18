export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  created: string;
  updated: string;
};

export type Family = {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type FamilyMember = Pick<
  User,
  "id" | "email" | "firstName" | "lastName"
> & {
  joinedAt: string;
};

export type Invitation = {
  id: string;
  sender: string;
  recipient: string;
  family: string;
  accepted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Coordinates = {
  lat: number;
  lon: number;
};

export type MemberLocations = {
  userId: string;
  firstName: string;
  lastName: string;
  coordinates: Coordinates;
  recordedAt: string;
};
