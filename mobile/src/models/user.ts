import DB from "../db";
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function createUser(
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  createdAt: Date,
  updatedAt: Date,
): Promise<{ success: true; data: User } | { success: false; error: Error }> {
  const query = `
  INSERT INTO users (
    id,
    email,
    firstName,
    lastName,
    createdAt,
    updatedAt,
  ) VALUES (
    ?, ?, ?, ?, ?, ?
  )
  RETURNING id,
    email,
    firstName,
    lastName,
    createdAt,
    updatedAt
  `;

  const record = await DB.getFirstAsync<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
  }>(
    query,
    id,
    email,
    firstName,
    lastName,
    createdAt.toISOString(),
    updatedAt.toISOString(),
  );

  if (!record) {
    return {
      success: false,
      error: new Error("Failed to create local user record."),
    };
  }

  return {
    success: true,
    data: {
      ...record,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    },
  };
}
