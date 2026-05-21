import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import { getMusicManager } from "../../lib/musicManager.js";

export const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("تخطي الأغنية الحالية");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const member = interaction.member as GuildMember;
  if (!member?.voice?.channel) {
    await interaction.reply({ content: "❌ يجب أن تكون في قناة صوتية!", flags: 64 });
    return;
  }
  if (!interaction.guildId) return;

  const player = getMusicManager().getPlayer(interaction.guildId);
  if (!player?.playing) {
    await interaction.reply({ content: "❌ لا توجد أغنية تعزف حالياً.", flags: 64 });
    return;
  }

  const skippedTitle = player.queue.current?.info.title ?? "غير معروف";
  await player.skip();

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setDescription(
      `⏭️ تم تخطي **${skippedTitle}**${
        player.queue.tracks.length > 0
          ? ` • القادم: **${player.queue.tracks[0]?.info.title}**`
          : " • القائمة فارغة"
      }`
    );
  await interaction.reply({ embeds: [embed] });
}
