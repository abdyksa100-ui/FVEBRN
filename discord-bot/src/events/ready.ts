import { Client, REST, Routes, ActivityType } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import type { Command } from "../types.js";
import { getMusicManager } from "../lib/musicManager.js";

export const name = "ready";
export const once = true;

export async function execute(client: Client): Promise<void> {
  console.log(`✅ البوت شغّال! مسجّل دخول كـ: ${client.user?.tag}`);

  client.user?.setActivity("الخادم 🛡️", { type: ActivityType.Watching });

  // Initialize Lavalink
  if (client.user) {
    try {
      await getMusicManager().init(
        { id: client.user.id, username: client.user.username },
        { clientId: client.user.id, clientName: client.user.username, shards: "auto" }
      );
      console.log("✅ Lavalink مُهيَّأ");
    } catch (err) {
      console.error("❌ فشل تهيئة Lavalink:", err);
    }
  }

  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!token || !clientId) return;

  const commands: object[] = [];
  const commandsPath = join(__dirname, "..", "commands");
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
  try {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log(`✅ تم تسجيل ${commands.length} أمر بنجاح`);
  } catch (err) {
    console.error("❌ فشل تسجيل الأوامر:", err);
  }
}
