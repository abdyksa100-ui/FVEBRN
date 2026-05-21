import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unban")
  .setDescription("رفع الحظر عن عضو")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addStringOption((opt) =>
    opt
      .setName("userid")
      .setDescription("ID العضو المراد رفع حظره")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("سبب رفع الحظر").setRequired(false)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const userId = interaction.options.getString("userid", true);
  const reason =
    interaction.options.getString("reason") ?? "لم يتم تحديد سبب";

  try {
    const ban = await interaction.guild?.bans.fetch(userId);
    if (!ban) {
      await interaction.reply({
        content: "❌ هذا العضو غير محظور.",
        ephemeral: true,
      });
      return;
    }

    await interaction.guild?.bans.remove(
      userId,
      `${reason} | بواسطة: ${interaction.user.tag}`
    );

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ تم رفع الحظر")
      .addFields(
        {
          name: "العضو",
          value: `${ban.user.tag} (${userId})`,
          inline: true,
        },
        { name: "المسؤول", value: interaction.user.tag, inline: true },
        { name: "السبب", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({
      content: "❌ لم يتم إيجاد هذا العضو في قائمة المحظورين.",
      ephemeral: true,
    });
  }
}
