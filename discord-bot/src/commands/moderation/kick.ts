import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("طرد عضو من الخادم")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("العضو المراد طرده").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("سبب الطرد").setRequired(false)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const target = interaction.options.getUser("user", true);
  const reason =
    interaction.options.getString("reason") ?? "لم يتم تحديد سبب";

  let member = interaction.guild?.members.cache.get(target.id);
  if (!member) {
    try { member = await interaction.guild?.members.fetch(target.id); } catch { /* ignore */ }
  }
  if (!member) {
    await interaction.reply({
      content: "❌ العضو غير موجود في الخادم.",
      ephemeral: true,
    });
    return;
  }

  if (!member.kickable) {
    await interaction.reply({
      content: "❌ لا أستطيع طرد هذا العضو (صلاحياته أعلى مني).",
      ephemeral: true,
    });
    return;
  }

  try {
    await member.kick(`${reason} | بواسطة: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0xff8c00)
      .setTitle("👢 تم الطرد")
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
