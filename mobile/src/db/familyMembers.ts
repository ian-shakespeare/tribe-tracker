import DB from "./index";
import type { FamilyMember } from "../models/familyMember";

export async function createFamilyMember(
  familyMember: FamilyMember,
): Promise<
  | { success: true; familyMember: FamilyMember }
  | { success: false; error: Error }
> {
  const query = `
  INSERT INTO familyMembers (
    user,
    family,
    createdAt
  ) VALUES (
    ?, ?, ?
  )
  RETURNING user,
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

export async function upsertFamilyMembers(familyMembers: FamilyMember[]) {
  const statement = await DB.prepareAsync(`
  INSERT INTO familyMembers (
    user,
    family,
    createdAt
  ) VALUES (
    $user, $family, $createdAt
  )
  ON CONFLICT (user, family)
  DO NOTHING
  `);

  await Promise.all(
    familyMembers.map(({ user, family, createdAt }) =>
      statement.executeAsync({
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
