import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import { getMusicManager } from "../../lib/musicManager.js";

export const data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("إيقاف مؤقت للموسيقى");

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

  if (player.paused) {
    await interaction.reply({ content: "⚠️ الموسيقى متوقفة مؤقتاً مسبقاً.", flags: 64 });
    return;
  }

  await player.pause();
  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setDescription("⏸️ تم الإيقاف المؤقت.");
  await interaction.reply({ embeds: [embed] });
}
