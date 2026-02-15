import type { Migration } from "../migrations";

const RemoveInvitations: Migration = {
  name: "remove_invitations",

  up: async (db) => {
    await db.execAsync("DROP INDEX IF EXISTS invitation_id_idx");

    await db.execAsync("DROP TABLE IF EXISTS invitations");
  },
};

export default RemoveInvitations;
