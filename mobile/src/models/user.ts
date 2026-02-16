import DB from "../db";
import { Location } from "./locations";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function upsertUser(
  user: User,
): Promise<{ success: true; data: User } | { success: false; error: Error }> {
  const query = `
  INSERT INTO users (
    id,
    email,
    firstName,
    lastName,
    avatar,
    createdAt,
    updatedAt
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
  ON CONFLICT (id)
  DO UPDATE SET
    email = excluded.email,
    firstName = excluded.firstName,
    lastName = excluded.lastName,
    avatar = excluded.avatar,
    updatedAt = excluded.updatedAt
  RETURNING id,
    email,
    firstName,
    lastName,
    avatar,
    createdAt,
    updatedAt
  `;

  const record = await DB.getFirstAsync<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
  }>(
    query,
    user.id,
    user.email,
    user.firstName,
    user.lastName,
    user.avatar ?? null,
    user.createdAt.toISOString(),
    user.updatedAt.toISOString(),
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

export async function upsertUsers(users: User[]) {
  const statement = await DB.prepareAsync(`
  INSERT INTO users (
    id,
    email,
    firstName,
    lastName,
    avatar,
    createdAt,
    updatedAt
  ) VALUES (
    $id, $email, $firstName, $lastName, $avatar, $createdAt, $updatedAt
  )
  ON CONFLICT (id)
  DO UPDATE SET
    email = excluded.email,
    firstName = excluded.firstName,
    lastName = excluded.lastName,
    avatar = excluded.avatar,
    updatedAt = excluded.updatedAt
  `);

  await Promise.all(
    users.map(
      ({ id, email, firstName, lastName, avatar, createdAt, updatedAt }) =>
        statement.executeAsync({
          $id: id,
          $email: email,
          $firstName: firstName,
          $lastName: lastName,
          $avatar: !avatar ? null : avatar,
          $createdAt: createdAt.toISOString(),
          $updatedAt: updatedAt.toISOString(),
        }),
    ),
  );

  await statement.finalizeAsync();
}

export async function getUser(id: string): Promise<User | null> {
  const query = `
  SELECT id,
    email,
    firstName,
    lastName,
    avatar,
    createdAt,
    updatedAt
  from users
  where id = ?
  `;

  const record = await DB.getFirstAsync<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
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

type UserLocation = Pick<User, "firstName" | "lastName"> &
  Pick<Location, "coordinates"> & { recordedAt: Date };

export async function getUserLocations(): Promise<UserLocation[]> {
  const query = `
  WITH latest_locations AS (
    SELECT user,
      coordinates,
      createdAt
    FROM locations
    GROUP BY user
    HAVING MAX(createdAt)
  )
  SELECT u.firstName,
    u.lastName,
    ll.coordinates,
    ll.createdAt AS recordedAt
  FROM latest_locations ll
  JOIN users u
    ON ll.user = u.id
  ORDER BY recordedAt DESC
  `;

  const records = await DB.getAllAsync<{
    firstName: string;
    lastName: string;
    coordinates: string;
    recordedAt: string;
  }>(query);

  return records.map((record) => ({
    ...record,
    coordinates: JSON.parse(JSON.parse(record.coordinates)),
    recordedAt: new Date(record.recordedAt),
  }));
}

type UpdateUser = Partial<Pick<User, "firstName" | "lastName" | "avatar">>;

export async function updateUser(
  id: string,
  user: UpdateUser,
): Promise<{ success: true; user: User } | { success: false; error: Error }> {
  const now = new Date();

  const query = `
  UPDATE users
  SET firstName = ifnull(?, firstName),
    lastName = ifnull(?, lastName),
    avatar = ifnull(?, avatar),
    updatedAt = ?
  WHERE id = ?
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
    user.firstName ?? null,
    user.lastName ?? null,
    user.avatar ?? null,
    now.toISOString(),
    id,
  );

  if (!record) {
    return { success: false, error: new Error("Failed to update local user.") };
  }

  return {
    success: true,
    user: {
      ...record,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    },
  };
}

export async function deleteUsers(ids: string[]) {
  const statement = await DB.prepareAsync(
    "DELETE FROM users WHERE id = $userId",
  );

  await Promise.all([ids.map((id) => statement.executeAsync({ $userId: id }))]);

  await statement.finalizeAsync();
}

export async function deleteAllUsers() {
  await DB.runAsync("DELETE FROM users");
}
