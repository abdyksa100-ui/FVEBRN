import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import { getMusicManager } from "../../lib/musicManager.js";

export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("إيقاف الموسيقى ومسح القائمة");

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
    await interaction.reply({ content: "❌ البوت لا يعزف شيئاً حالياً.", flags: 64 });
    return;
  }

  await player.stopPlaying(true, true);
  await player.destroy();

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setDescription("⏹️ تم إيقاف الموسيقى ومسح القائمة.");
  await interaction.reply({ embeds: [embed] });
}
