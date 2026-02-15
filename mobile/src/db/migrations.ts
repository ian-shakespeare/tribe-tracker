import type { SQLiteDatabase } from "expo-sqlite";
import "./migrations";
import InitialSchema from "./migrations/0001_initial_schema";
import RemoveInvitations from "./migrations/0002_remove_invitations";

export interface Migration {
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

// Registry of all migrations in order
const migrations = [InitialSchema, RemoveInvitations];

/**
 * Get all registered migrations
 */
export function getMigrations(): Migration[] {
  return migrations;
}

/**
 * Get the current schema version from the database
 */
async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  return result?.user_version ?? 0;
}

/**
 * Mark a migration as applied
 */
async function setCurrentVersion(db: SQLiteDatabase, version: number) {
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

/**
 * Run all pending migrations
 */
export async function runMigrations(db: SQLiteDatabase) {
  console.log("runMigrations");
  try {
    // Get current version
    const currentVersion = await getCurrentVersion(db);

    const pendingMigrations = migrations.slice(currentVersion);
    if (pendingMigrations.length === 0) {
      console.log(`no pending migrations: ${currentVersion}`);
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migration(s)...`);

    // Run each pending migration in a transaction
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.name}`);

      await migration.up(db);

      console.log(`Migration ${migration.name} applied successfully`);
    }

    await setCurrentVersion(db, migrations.length);

    console.log("All migrations completed successfully");
    return { success: true, data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(message);
  }
}
