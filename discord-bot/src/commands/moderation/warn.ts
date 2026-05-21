import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { addWarning, getWarningCount } from "../../lib/db.js";

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("إعطاء تحذير لعضو")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt
      .setName("user")
      .setDescription("العضو المراد تحذيره")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("سبب التحذير").setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);

  if (!interaction.guildId) return;

  if (target.bot) {
    await interaction.reply({
      content: "❌ لا يمكن تحذير البوتات.",
      ephemeral: true,
    });
    return;
  }

  const warning = addWarning(
    interaction.guildId,
    target.id,
    interaction.user.id,
    reason
  );
  const totalWarnings = getWarningCount(interaction.guildId, target.id);

  const embed = new EmbedBuilder()
    .setColor(0xffff00)
    .setTitle("⚠️ تحذير")
    .addFields(
      { name: "العضو", value: `${target.tag} (${target.id})`, inline: true },
      { name: "المسؤول", value: interaction.user.tag, inline: true },
      { name: "رقم التحذير", value: `#${warning.id}`, inline: true },
      {
        name: "إجمالي التحذيرات",
        value: `${totalWarnings}`,
        inline: true,
      },
      { name: "السبب", value: reason }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  try {
    await target.send(
      `⚠️ لقد تلقيت تحذيراً في **${interaction.guild?.name}**\n**السبب:** ${reason}`
    );
  } catch {
    // DM disabled
  }
}
