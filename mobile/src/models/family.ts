import DB from "../db";

export type Family = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function createFamily(
  family: Family,
): Promise<
  { success: true; family: Family } | { success: false; error: Error }
> {
  const query = `
  INSERT INTO families (
    id,
    name,
    createdBy,
    createdAt,
    updatedAt
  ) VALUES (
    ?, ?, ?, ?, ?
  )
  RETURNING id,
    name,
    createdBy,
    createdAt,
    updatedAt
  `;

  const record = await DB.getFirstAsync<{
    id: string;
    name: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }>(
    query,
    family.id,
    family.name,
    family.createdBy,
    family.createdAt.toISOString(),
    family.updatedAt.toISOString(),
  );

  if (!record) {
    return {
      success: false,
      error: new Error("Failed to create local family record."),
    };
  }

  return {
    success: true,
    family: {
      ...record,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    },
  };
}

export async function upsertFamilies(families: Family[]) {
  const statement = await DB.prepareAsync(`
  INSERT INTO families (
    id,
    name,
    createdBy,
    createdAt,
    updatedAt
  ) VALUES (
    $id, $name, $createdBy, $createdAt, $updatedAt
  )
  ON CONFLICT (id)
  DO UPDATE SET
    name = name,
    updatedAt = updatedAt
  `);

  await Promise.all(
    families.map(({ id, name, createdBy, createdAt, updatedAt }) =>
      statement.executeAsync({
        $id: id,
        $name: name,
        $createdBy: createdBy,
        $createdAt: createdAt.toISOString(),
        $updatedAt: updatedAt.toISOString(),
      }),
    ),
  );

  await statement.finalizeAsync();
}

export async function getAllFamilies(): Promise<Family[]> {
  const query = `
  SELECT id,
    name,
    createdBy,
    createdAt,
    updatedAt
  FROM families
  `;

  const records = await DB.getAllAsync<{
    id: string;
    name: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }>(query);

  return records.map((record) => ({
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  }));
}

export async function getFamily(id: string): Promise<Family | null> {
  const query = `
  SELECT id,
    name,
    createdBy,
    createdAt,
    updatedAt
  FROM families
  WHERE id = ?
  `;

  const record = await DB.getFirstAsync<{
    id: string;
    name: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }>(query, id);

  if (!record) {
    return null;
  }

  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

export type FamilyMemberUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  joinedAt: Date;
};

export async function getFamilyMembers(
  id: string,
): Promise<FamilyMemberUser[]> {
  const query = `
  SELECT u.id,
    u.email,
    u.firstName,
    u.lastName,
    u.avatar,
    fm.createdAt as joinedAt
  FROM families f
  JOIN familyMembers fm
    ON f.id = fm.family
  JOIN users u
    ON fm.user = u.id
  WHERE f.id = ?
  `;

  const records = await DB.getAllAsync<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    joinedAt: string;
  }>(query, id);

  return records.map((record) => ({
    ...record,
    joinedAt: new Date(record.joinedAt),
  }));
}

export async function deleteFamilies(ids: string[]) {
  const statement = await DB.prepareAsync(
    "DELETE FROM families WHERE id = $familyId",
  );

  await Promise.all([
    ids.map((id) => statement.executeAsync({ $familyId: id })),
  ]);

  await statement.finalizeAsync();
}

export async function deleteAllFamilies() {
  await DB.runAsync("DELETE FROM families");
}
