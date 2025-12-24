export type User = {
  id: string;
  email: string;
  avatar?: string;
  firstName: string;
  lastName: string;
  created: string;
  updated: string;
};

export type NewUser = Omit<User, "id" | "created" | "updated"> & {
  password: string;
  passwordConfirm: string;
  emailVisibility: boolean;
};

export type Family = {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type NewFamily = Omit<
  Family,
  "id" | "createdBy" | "createdAt" | "updatedAt"
> & {
  code: string;
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

export type MemberLocation = {
  userId: string;
  firstName: string;
  lastName: string;
  coordinates: Coordinates;
  recordedAt: string;
};

export type FamilyDetails = Omit<Family, "members"> & {
  members: FamilyMember[];
  joinedAt: string;
};

export type FamilyInvitation = {
  id: string;
  familyName: string;
  createdAt: string;
};
