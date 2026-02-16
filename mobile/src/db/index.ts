import { openDatabaseSync } from "expo-sqlite";

const DB = openDatabaseSync("tribetracker.db", { enableChangeListener: true });

export default DB;
