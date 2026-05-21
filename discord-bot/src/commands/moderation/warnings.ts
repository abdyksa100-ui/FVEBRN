import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { getWarnings } from "../../lib/db.js";

export const data = new SlashCommandBuilder()
  .setName("warnings")
  .setDescription("عرض تحذيرات عضو")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt
      .setName("user")
      .setDescription("العضو المراد عرض تحذيراته")
      .setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const target = interaction.options.getUser("user", true);
  if (!interaction.guildId) return;

  const warnings = getWarnings(interaction.guildId, target.id);

  if (warnings.length === 0) {
    await interaction.reply({
      content: `✅ **${target.tag}** ليس لديه أي تحذيرات.`,
      ephemeral: true,
    });
    return;
  }

  const warningList = warnings
    .slice(0, 10)
    .map((w, i) => {
      const date = new Date(w.created_at * 1000).toLocaleDateString("ar-SA");
      return `**#${w.id}** — ${w.reason}\n> <@${w.moderator_id}> • ${date}`;
    })
    .join("\n\n");

  const embed = new EmbedBuilder()
    .setColor(0xffff00)
    .setTitle(`⚠️ تحذيرات ${target.tag}`)
    .setThumbnail(target.displayAvatarURL())
    .setDescription(warningList)
    .setFooter({
      text: `إجمالي التحذيرات: ${warnings.length}${warnings.length > 10 ? " (عرض آخر 10)" : ""}`,
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
