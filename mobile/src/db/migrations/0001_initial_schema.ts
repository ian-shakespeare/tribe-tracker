import type { Migration } from "../migrations";

const InitialSchema: Migration = {
  name: "initial_schema",

  up: async (db) => {
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync("PRAGMA foreign_keys = ON;");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        avatar TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS families (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        name TEXT NOT NULL,
        createdBy TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS familyMembers (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        user TEXT NOT NULL,
        family TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (family) REFERENCES families(id) ON DELETE CASCADE
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        sender TEXT NOT NULL,
        recipient TEXT NOT NULL,
        family TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (family) REFERENCES families(id) ON DELETE SET NULL
      );
    `);
    await db.execAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS invitation_id_idx ON invitations(id);
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        user TEXT NOT NULL,
        coordinates TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    await db.execAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS location_id_idx ON locations(id);
    `);
  },
};

export default InitialSchema;
