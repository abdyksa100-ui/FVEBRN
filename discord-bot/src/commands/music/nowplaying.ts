import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getMusicManager } from "../../lib/musicManager.js";

export const data = new SlashCommandBuilder()
  .setName("nowplaying")
  .setDescription("عرض الأغنية التي تعزف الآن");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!interaction.guildId) return;

  const player = getMusicManager().getPlayer(interaction.guildId);
  if (!player?.queue.current) {
    await interaction.reply({ content: "❌ لا توجد أغنية تعزف حالياً.", flags: 64 });
    return;
  }

  const track = player.queue.current;
  const ms = track.info.duration;
  const min = Math.floor(ms / 60000);
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");

  const posMs = player.position;
  const posMin = Math.floor(posMs / 60000);
  const posSec = String(Math.floor((posMs % 60000) / 1000)).padStart(2, "0");

  const statusText = player.paused ? "⏸️ متوقف مؤقتاً" : "▶️ يعزف الآن";

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(statusText)
    .setDescription(`**[${track.info.title}](${track.info.uri})**`)
    .addFields(
      { name: "المدة", value: `${posMin}:${posSec} / ${min}:${sec}`, inline: true },
      { name: "الفنان", value: track.info.author || "غير معروف", inline: true },
      { name: "في الانتظار", value: `${player.queue.tracks.length} أغنية`, inline: true }
    )
    .setTimestamp();

  if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
  await interaction.reply({ embeds: [embed] });
}
