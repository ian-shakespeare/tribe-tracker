import type { Migration } from "../migrations";

const RemoveFamilyMemberId: Migration = {
  name: "remove_family_member_id",

  up: async (db) => {
    await db.execAsync("ALTER TABLE familyMembers RENAME TO old_familyMembers");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS familyMembers (
        user TEXT NOT NULL,
        family TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (family) REFERENCES families(id) ON DELETE CASCADE,
        UNIQUE (user, family)
      );
    `);

    await db.execAsync(`
      INSERT INTO familyMembers
      SELECT user,
        family,
        createdAt
      FROM old_familyMembers
    `);

    await db.execAsync("DROP TABLE old_familyMembers");
  },
};

export default RemoveFamilyMemberId;
