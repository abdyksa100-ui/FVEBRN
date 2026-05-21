import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dataDir = join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });
const dbPath = join(dataDir, "warnings.json");

export interface Warning {
  id: number;
  guild_id: string;
  user_id: string;
  moderator_id: string;
  reason: string;
  created_at: number;
}

interface DB {
  warnings: Warning[];
  nextId: number;
}

function load(): DB {
  if (!existsSync(dbPath)) {
    return { warnings: [], nextId: 1 };
  }
  try {
    return JSON.parse(readFileSync(dbPath, "utf-8")) as DB;
  } catch {
    return { warnings: [], nextId: 1 };
  }
}

function save(db: DB): void {
  writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export function addWarning(
  guildId: string,
  userId: string,
  moderatorId: string,
  reason: string
): Warning {
  const db = load();
  const warning: Warning = {
    id: db.nextId++,
    guild_id: guildId,
    user_id: userId,
    moderator_id: moderatorId,
    reason,
    created_at: Math.floor(Date.now() / 1000),
  };
  db.warnings.push(warning);
  save(db);
  return warning;
}

export function getWarnings(guildId: string, userId: string): Warning[] {
  const db = load();
  return db.warnings
    .filter((w) => w.guild_id === guildId && w.user_id === userId)
    .sort((a, b) => b.created_at - a.created_at);
}

export function clearWarnings(guildId: string, userId: string): number {
  const db = load();
  const before = db.warnings.length;
  db.warnings = db.warnings.filter(
    (w) => !(w.guild_id === guildId && w.user_id === userId)
  );
  const count = before - db.warnings.length;
  save(db);
  return count;
}

export function getWarningCount(guildId: string, userId: string): number {
  const db = load();
  return db.warnings.filter(
    (w) => w.guild_id === guildId && w.user_id === userId
  ).length;
}
