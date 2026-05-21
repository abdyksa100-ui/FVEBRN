import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { clearWarnings } from "../../lib/db.js";

export const data = new SlashCommandBuilder()
  .setName("clearwarnings")
  .setDescription("مسح جميع تحذيرات عضو")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((opt) =>
    opt
      .setName("user")
      .setDescription("العضو المراد مسح تحذيراته")
      .setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const target = interaction.options.getUser("user", true);
  if (!interaction.guildId) return;

  const count = clearWarnings(interaction.guildId, target.id);

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("🗑️ تم مسح التحذيرات")
    .setDescription(
      count > 0
        ? `تم مسح **${count}** تحذير لـ **${target.tag}**`
        : `**${target.tag}** ليس لديه تحذيرات أصلاً`
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
