import DB from "../db";

export type FamilyMember = {
  id: string;
  user: string;
  family: string;
  createdAt: Date;
};

export async function createFamilyMember(
  familyMember: FamilyMember,
): Promise<
  | { success: true; familyMember: FamilyMember }
  | { success: false; error: Error }
> {
  const query = `
  INSERT INTO familyMembers (
    id,
    user,
    family,
    createdAt
  ) VALUES (
    ?, ?, ?, ?
  )
  RETURNING id,
    user,
    family,
    createdAt
  `;

  const record = await DB.getFirstAsync<{
    id: string;
    user: string;
    family: string;
    createdAt: string;
  }>(
    query,
    familyMember.id,
    familyMember.user,
    familyMember.family,
    familyMember.createdAt.toISOString(),
  );

  if (!record) {
    return {
      success: false,
      error: new Error("Failed to create local family record."),
    };
  }

  return {
    success: true,
    familyMember: {
      ...record,
      createdAt: new Date(record.createdAt),
    },
  };
}

export async function createFamilyMembers(familyMembers: FamilyMember[]) {
  const statement = await DB.prepareAsync(`
  INSERT INTO familyMembers (
    id,
    user,
    family,
    createdAt
  ) VALUES (
    $id, $user, $family, $createdAt
  )
  `);

  await Promise.all(
    familyMembers.map(({ id, user, family, createdAt }) =>
      statement.executeAsync({
        $id: id,
        $user: user,
        $family: family,
        $createdAt: createdAt.toISOString(),
      }),
    ),
  );

  await statement.finalizeAsync();
}

export async function deleteAllFamilyMembers() {
  await DB.runAsync("DELETE FROM familyMembers");
}
