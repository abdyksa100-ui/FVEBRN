import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("purge")
  .setDescription("حذف عدد من الرسائل")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((opt) =>
    opt
      .setName("amount")
      .setDescription("عدد الرسائل للحذف (1-100)")
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true)
  )
  .addUserOption((opt) =>
    opt
      .setName("user")
      .setDescription("حذف رسائل عضو معين فقط (اختياري)")
      .setRequired(false)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const amount = interaction.options.getInteger("amount", true);
  const targetUser = interaction.options.getUser("user");
  const channel = interaction.channel as TextChannel;

  if (!channel) {
    await interaction.reply({ content: "❌ خطأ في القناة.", ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    let messages = await channel.messages.fetch({ limit: 100 });

    if (targetUser) {
      messages = messages.filter((m) => m.author.id === targetUser.id);
    }

    const toDelete = [...messages.values()].slice(0, amount);
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const deletable = toDelete.filter(
      (m) => m.createdTimestamp > twoWeeksAgo
    );

    if (deletable.length === 0) {
      await interaction.editReply("❌ لا توجد رسائل قابلة للحذف (أقل من 14 يوم).");
      return;
    }

    const deleted = await channel.bulkDelete(deletable, true);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(
        `🗑️ تم حذف **${deleted.size}** رسالة${targetUser ? ` من **${targetUser.tag}**` : ""}`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply("❌ فشل حذف الرسائل.");
  }
}
