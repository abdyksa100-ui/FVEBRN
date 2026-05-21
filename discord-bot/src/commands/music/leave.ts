import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import { getMusicManager } from "../../lib/musicManager.js";

export const data = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("خروج البوت من القناة الصوتية");

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
    await interaction.reply({ content: "❌ البوت ليس في قناة صوتية.", flags: 64 });
    return;
  }

  await player.destroy();

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setDescription("👋 تم الخروج من القناة الصوتية وتنظيف القائمة.");
  await interaction.reply({ embeds: [embed] });
}
