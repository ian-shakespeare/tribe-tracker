import type { SQLiteDatabase } from "expo-sqlite";
import InitialSchema from "./migrations/0001_initial_schema";
import RemoveInvitations from "./migrations/0002_remove_invitations";

export interface Migration {
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

// Registry of all migrations in order
const migrations = [InitialSchema, RemoveInvitations];

export function getMigrations(): Migration[] {
  return migrations;
}

async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  return result?.user_version ?? 0;
}

async function setCurrentVersion(db: SQLiteDatabase, version: number) {
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

export async function runMigrations(db: SQLiteDatabase) {
  try {
    const currentVersion = await getCurrentVersion(db);

    const pendingMigrations = migrations.slice(currentVersion);
    if (pendingMigrations.length === 0) {
      return;
    }

    for (const migration of pendingMigrations) {
      await migration.up(db);
    }

    await setCurrentVersion(db, migrations.length);
    return { success: true, data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(message);
  }
}
