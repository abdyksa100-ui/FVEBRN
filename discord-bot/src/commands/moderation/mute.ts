import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("كتم عضو (Timeout)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("العضو المراد كتمه").setRequired(true)
  )
  .addIntegerOption((opt) =>
    opt
      .setName("duration")
      .setDescription("مدة الكتم بالدقائق")
      .setMinValue(1)
      .setMaxValue(40320)
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("سبب الكتم").setRequired(false)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const target = interaction.options.getUser("user", true);
  const duration = interaction.options.getInteger("duration", true);
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

  if (!member.moderatable) {
    await interaction.reply({
      content: "❌ لا أستطيع كتم هذا العضو.",
      ephemeral: true,
    });
    return;
  }

  try {
    const ms = duration * 60 * 1000;
    await member.timeout(ms, `${reason} | بواسطة: ${interaction.user.tag}`);

    const until = new Date(Date.now() + ms);
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle("🔇 تم الكتم")
      .addFields(
        { name: "العضو", value: `${target.tag} (${target.id})`, inline: true },
        { name: "المسؤول", value: interaction.user.tag, inline: true },
        { name: "المدة", value: `${duration} دقيقة`, inline: true },
        {
          name: "ينتهي في",
          value: `<t:${Math.floor(until.getTime() / 1000)}:R>`,
          inline: true,
        },
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
