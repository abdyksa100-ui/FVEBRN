import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import { getMusicManager } from "../../lib/musicManager.js";

export const data = new SlashCommandBuilder()
  .setName("resume")
  .setDescription("استئناف تشغيل الموسيقى");

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
  if (!player) {
    await interaction.reply({ content: "❌ لا توجد موسيقى حالياً.", flags: 64 });
    return;
  }

  if (!player.paused) {
    await interaction.reply({ content: "⚠️ الموسيقى تعزف مسبقاً.", flags: 64 });
    return;
  }

  await player.resume();
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setDescription("▶️ تم استئناف التشغيل.");
  await interaction.reply({ embeds: [embed] });
}
