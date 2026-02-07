import {
  familiesTable,
  familyMembersTable,
  invitationsTable,
  locationsTable,
  usersTable,
} from "../db/schema";

export type User = typeof usersTable.$inferSelect;

export type Family = typeof familiesTable.$inferSelect;

export type FamilyMember = typeof familyMembersTable.$inferSelect;

export type Invitation = typeof invitationsTable.$inferSelect;

export type Location = typeof locationsTable.$inferSelect;

type SoftDelete = {
  isDeleted: boolean;
};

export type RemoteUser = User & SoftDelete;
export type RemoteFamily = Family & SoftDelete;

export type NewUser = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  password: string;
  passwordConfirm: string;
};
