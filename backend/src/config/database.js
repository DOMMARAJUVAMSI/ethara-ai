import fs from "fs";
import os from "os";
import path from "path";
import { DatabaseSync } from "node:sqlite";

const defaultUrl = "file:%LOCALAPPDATA%/EtharaAI/dev.db";

const expandEnvironmentVariables = (value) =>
  value.replace(/%([^%]+)%/g, (_match, variableName) => process.env[variableName] || "");

const resolveDatabasePath = () => {
  const databaseUrl = process.env.DATABASE_URL || defaultUrl;

  if (!databaseUrl.startsWith("file:")) {
    throw new Error("SQLite DATABASE_URL must start with file:");
  }

  const configuredPath = expandEnvironmentVariables(databaseUrl.slice("file:".length));

  if (!configuredPath) {
    return path.join(os.tmpdir(), "EtharaAI", "dev.db");
  }

  return path.isAbsolute(configuredPath)
    ? path.normalize(configuredPath)
    : path.resolve(process.cwd(), configuredPath);
};

const databasePath = resolveDatabasePath();
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);

db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    ownerId INTEGER NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER',
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(projectId, userId)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'TODO',
    dueDate TEXT,
    projectId INTEGER NOT NULL,
    assignedToId INTEGER,
    createdById INTEGER NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedToId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE CASCADE
  );
`);

const normalizeParams = (params) => {
  if (params === undefined || params === null) {
    return [];
  }

  return Array.isArray(params) ? params : [params];
};

export const run = (sql, params) => db.prepare(sql).run(...normalizeParams(params));
export const get = (sql, params) => db.prepare(sql).get(...normalizeParams(params));
export const all = (sql, params) => db.prepare(sql).all(...normalizeParams(params));

export const transaction = (callback) => {
  db.exec("BEGIN IMMEDIATE");

  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

export default db;