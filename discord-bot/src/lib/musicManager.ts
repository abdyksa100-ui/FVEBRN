import { LavalinkManager, DefaultSources } from "lavalink-client";
import type { Client } from "discord.js";

export let manager: LavalinkManager;

export function createMusicManager(client: Client): LavalinkManager {
  manager = new LavalinkManager({
    nodes: [
      {
        host: "lavalink.jirayu.net",
        port: 13592,
        authorization: "youshallnotpass",
        secure: false,
        id: "node1",
        retryAmount: 5,
        retryDelay: 3000,
      },
    ],
    sendToShard: (guildId: string, payload: unknown) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
    playerOptions: {
      defaultSearchPlatform: DefaultSources.soundcloud,
      volumeDecrementer: 0.75,
    },
    queueOptions: {
      maxPreviousTracks: 10,
    },
  });

  manager.nodeManager.on("create", (node) => {
    console.log(`✅ Lavalink node created: ${node.id}`);
  });
  manager.nodeManager.on("connect", (node) => {
    console.log(`✅ Lavalink node connected: ${node.id}`);
  });
  manager.nodeManager.on("disconnect", (node, reason) => {
    console.warn(`⚠️  Lavalink node disconnected: ${node.id} — ${JSON.stringify(reason)}`);
  });
  manager.nodeManager.on("error", (node, error) => {
    console.error(`❌ Lavalink node error [${node.id}]:`, error?.message ?? error);
  });
  manager.nodeManager.on("resumed", (node) => {
    console.log(`🔄 Lavalink node resumed: ${node.id}`);
  });

  manager.on("trackStart", (player, track) => {
    if (!track) return;
    const ch = client.channels.cache.get(player.textChannelId ?? "");
    if (!ch || !("send" in ch)) return;
    const ms = track.info.duration ?? 0;
    const min = Math.floor(ms / 60000);
    const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    (ch as import("discord.js").TextChannel).send({
      embeds: [
        {
          color: 0x5865f2,
          title: "🎵 يتم التشغيل الآن",
          description: `**[${track.info.title}](${track.info.uri})**`,
          fields: [
            { name: "المدة", value: `${min}:${sec}`, inline: true },
            { name: "الفنان", value: track.info.author || "غير معروف", inline: true },
          ],
          thumbnail: track.info.artworkUrl
            ? { url: track.info.artworkUrl }
            : undefined,
        },
      ],
    }).catch(() => null);
  });

  manager.on("queueEnd", (player) => {
    const ch = client.channels.cache.get(player.textChannelId ?? "");
    if (ch && "send" in ch) {
      (ch as import("discord.js").TextChannel).send("✅ انتهت قائمة التشغيل.").catch(() => null);
    }
    setTimeout(() => {
      if (!player.playing && !player.paused) {
        player.destroy().catch(() => null);
      }
    }, 60_000);
  });

  manager.on("playerDestroy", (player) => {
    console.log(`🗑️  Player destroyed for guild: ${player.guildId}`);
  });

  return manager;
}

export function getMusicManager(): LavalinkManager {
  return manager;
}
