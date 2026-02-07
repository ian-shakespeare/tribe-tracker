import type { SQLiteDatabase } from "expo-sqlite";

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => void;
  down: (db: SQLiteDatabase) => void;
}

// Registry of all migrations in order
const migrations: Migration[] = [];

/**
 * Register a migration to be tracked by the migration system
 */
export function registerMigration(migration: Migration) {
  migrations.push(migration);
  // Keep migrations sorted by version
  migrations.sort((a, b) => a.version - b.version);
}

/**
 * Get all registered migrations
 */
export function getMigrations(): Migration[] {
  return migrations;
}

/**
 * Initialize the schema_migrations table if it doesn't exist
 */
function initializeMigrationTable(db: SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

/**
 * Get the current schema version from the database
 */
function getCurrentVersion(db: SQLiteDatabase): number {
  const result = db.getFirstSync<{ version: number }>(
    "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1",
  );
  return result?.version ?? 0;
}

/**
 * Mark a migration as applied
 */
function markMigrationApplied(db: SQLiteDatabase, migration: Migration) {
  db.runSync(
    "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)",
    [migration.version, migration.name, new Date().toISOString()],
  );
}

/**
 * Run all pending migrations
 */
export function runMigrations(db: SQLiteDatabase) {
  try {
    // Initialize the migration tracking table
    initializeMigrationTable(db);

    // Get current version
    const currentVersion = getCurrentVersion(db);

    // Get pending migrations
    const pendingMigrations = migrations.filter(
      (m) => m.version > currentVersion,
    );

    if (pendingMigrations.length === 0) {
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migration(s)...`);

    // Run each pending migration in a transaction
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);

      db.withTransactionSync(() => {
        migration.up(db);
        markMigrationApplied(db, migration);
      });

      console.log(`Migration ${migration.version} applied successfully`);
    }

    console.log("All migrations completed successfully");
    return { success: true, data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(message);
  }
}

/**
 * Rollback a specific migration (use with caution)
 */
export function rollbackMigration(
  db: SQLiteDatabase,
  version: number,
): { success: boolean; error?: string } {
  try {
    const migration = migrations.find((m) => m.version === version);

    if (!migration) {
      return { success: false, error: `Migration ${version} not found` };
    }

    console.log(`Rolling back migration ${version}: ${migration.name}`);

    db.withTransactionSync(() => {
      migration.down(db);
      db.runSync("DELETE FROM schema_migrations WHERE version = ?", [version]);
    });

    console.log(`Migration ${version} rolled back successfully`);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Rollback failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
