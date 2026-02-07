// Import all migrations to register them
import "./001_initial_schema";

// Re-export migration utilities
export { runMigrations, rollbackMigration, getMigrations } from "../migrations";
