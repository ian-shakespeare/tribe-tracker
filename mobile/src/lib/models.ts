export type Family = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
