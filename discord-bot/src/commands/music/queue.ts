import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getMusicManager } from "../../lib/musicManager.js";

export const data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("عرض قائمة التشغيل")
  .addIntegerOption((opt) =>
    opt
      .setName("page")
      .setDescription("رقم الصفحة")
      .setMinValue(1)
      .setRequired(false)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!interaction.guildId) return;

  const player = getMusicManager().getPlayer(interaction.guildId);
  if (!player?.queue.current && !player?.queue.tracks.length) {
    await interaction.reply({ content: "❌ القائمة فارغة.", flags: 64 });
    return;
  }

  const page = (interaction.options.getInteger("page") ?? 1) - 1;
  const perPage = 10;
  const queueTracks = player?.queue.tracks ?? [];
  const totalPages = Math.ceil((queueTracks.length + 1) / perPage) || 1;
  const lines: string[] = [];

  if (page === 0 && player?.queue.current) {
    const t = player.queue.current;
    const ms = t.info.duration ?? 0;
    const d = `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
    lines.push(`▶️ **يعزف الآن:** [${t.info.title}](${t.info.uri}) \`${d}\``);
  }

  const start = page === 0 ? 0 : page * perPage - 1;
  const end = start + (page === 0 ? perPage - 1 : perPage);
  const slice = queueTracks.slice(start, end);

  slice.forEach((track, idx) => {
    const pos = start + idx + 1;
    const ms = track.info.duration ?? 0;
    const d = `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
    lines.push(`**${pos}.** [${track.info.title}](${track.info.uri}) \`${d}\``);
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📋 قائمة التشغيل")
    .setDescription(lines.join("\n") || "القائمة فارغة")
    .setFooter({
      text: `صفحة ${page + 1}/${totalPages} • ${queueTracks.length} أغنية في الانتظار`,
    });

  await interaction.reply({ embeds: [embed] });
}
