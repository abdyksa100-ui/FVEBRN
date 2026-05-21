import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("حظر عضو من الخادم")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("العضو المراد حظره").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("سبب الحظر").setRequired(false)
  )
  .addIntegerOption((opt) =>
    opt
      .setName("days")
      .setDescription("حذف رسائل آخر X أيام (0-7)")
      .setMinValue(0)
      .setMaxValue(7)
      .setRequired(false)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const target = interaction.options.getUser("user", true);
  const reason =
    interaction.options.getString("reason") ?? "لم يتم تحديد سبب";
  const days = interaction.options.getInteger("days") ?? 0;

  let member = interaction.guild?.members.cache.get(target.id);
  if (!member) {
    try { member = await interaction.guild?.members.fetch(target.id); } catch { /* not in guild */ }
  }

  if (member) {
    if (!member.bannable) {
      await interaction.reply({
        content: "❌ لا أستطيع حظر هذا العضو (صلاحياته أعلى مني).",
        ephemeral: true,
      });
      return;
    }
  }

  try {
    await interaction.guild?.bans.create(target.id, {
      reason: `${reason} | بواسطة: ${interaction.user.tag}`,
      deleteMessageSeconds: days * 86400,
    });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("🔨 تم الحظر")
      .addFields(
        { name: "العضو", value: `${target.tag} (${target.id})`, inline: true },
        { name: "المسؤول", value: interaction.user.tag, inline: true },
        { name: "السبب", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({
      content: "❌ فشل تنفيذ الأمر.",
      ephemeral: true,
    });
  }
}
