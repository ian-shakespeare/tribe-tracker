export type Family = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FamilyMemberUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  joinedAt: Date;
};
