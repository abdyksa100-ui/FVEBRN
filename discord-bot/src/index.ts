import { Client, GatewayIntentBits, Collection } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import type { BotClient, Command } from "./types.js";
import { createMusicManager } from "./lib/musicManager.js";

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN غير موجود في المتغيرات البيئية");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
}) as BotClient;

client.commands = new Collection<string, Command>();

const musicManager = createMusicManager(client);

// Forward raw events to Lavalink (required for voice)
client.on("raw", (data) => musicManager.sendRawData(data));

async function loadCommands(): Promise<void> {
  const commandsPath = join(__dirname, "commands");
  const commandFolders = readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".js")
    );
    for (const file of commandFiles) {
      const command = require(join(folderPath, file)) as Partial<Command>;
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command as Command);
        console.log(`✅ تم تحميل الأمر: ${command.data.name}`);
      }
    }
  }
}

async function loadEvents(): Promise<void> {
  const eventsPath = join(__dirname, "events");
  const eventFiles = readdirSync(eventsPath).filter(
    (f) => f.endsWith(".ts") || f.endsWith(".js")
  );

  for (const file of eventFiles) {
    const event = require(join(eventsPath, file)) as {
      name: string;
      once?: boolean;
      execute: (...args: unknown[]) => void;
    };
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`✅ تم تحميل الحدث: ${event.name}`);
  }
}

async function main(): Promise<void> {
  await loadCommands();
  await loadEvents();
  await client.login(process.env.DISCORD_TOKEN);
}

main().catch((err) => {
  console.error("❌ فشل تشغيل البوت:", err);
  process.exit(1);
});

export { client, musicManager };
