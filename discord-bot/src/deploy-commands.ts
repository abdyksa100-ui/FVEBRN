import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import type { Command } from "./types.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error("❌ DISCORD_TOKEN أو DISCORD_CLIENT_ID غير موجود");
  process.exit(1);
}

const commands: object[] = [];

const commandsPath = join(__dirname, "commands");
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = join(commandsPath, folder);
  const commandFiles = readdirSync(folderPath).filter(
    (f) => f.endsWith(".ts") || f.endsWith(".js")
  );
  for (const file of commandFiles) {
    const command = require(join(folderPath, file)) as Partial<Command>;
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`🔄 جاري تسجيل ${commands.length} أمر...`);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("✅ تم تسجيل جميع الأوامر بنجاح!");
  } catch (err) {
    console.error("❌ فشل تسجيل الأوامر:", err);
  }
})();
