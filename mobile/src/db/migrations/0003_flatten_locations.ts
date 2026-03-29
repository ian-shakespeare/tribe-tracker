import type { Migration } from "../migrations";

const FlattenLocations: Migration = {
  name: "flatten_locations",

  up: async (db) => {
    await db.execAsync("ALTER TABLE locations RENAME TO old_locations");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        user TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await db.execAsync(`
      INSERT INTO locations
      SELECT id,
        user,
        JSON_EXTRACT(coordinates, '$.lat') lat,
        JSON_EXTRACT(coordinates, '$.lon') lon,
        createdAt
      FROM old_locations
    `);

    await db.execAsync("DROP TABLE old_locations");
  },
};

export default FlattenLocations;
