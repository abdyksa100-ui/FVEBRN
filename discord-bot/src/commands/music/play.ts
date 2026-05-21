import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  TextChannel,
} from "discord.js";
import { getMusicManager } from "../../lib/musicManager.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("تشغيل أغنية (ابحث بالاسم أو أدخل رابط)")
  .addStringOption((opt) =>
    opt
      .setName("query")
      .setDescription("اسم الأغنية أو الرابط")
      .setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const member = interaction.member as GuildMember;
  const voiceChannel = member?.voice?.channel;

  if (!voiceChannel) {
    await interaction.reply({ content: "❌ يجب أن تكون في قناة صوتية أولاً!", flags: 64 });
    return;
  }
  if (!interaction.guildId) return;
  await interaction.deferReply();

  const query = interaction.options.getString("query", true);
  const lava = getMusicManager();

  try {
    let player = lava.getPlayer(interaction.guildId);
    if (!player) {
      player = lava.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: voiceChannel.id,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: 100,
        instaUpdateFiltersFix: true,
      });
    } else {
      player.textChannelId = interaction.channelId;
      if (!player.connected) {
        player.voiceChannelId = voiceChannel.id;
      }
    }

    if (!player.connected) await player.connect();

    const result = await player.search(
      { query, source: "scsearch" },
      interaction.user
    );

    if (
      result.loadType === "error" ||
      result.loadType === "empty" ||
      !result.tracks.length
    ) {
      await interaction.editReply("❌ لم يتم إيجاد نتائج. جرب كلمات أخرى أو رابطاً مباشراً.");
      return;
    }

    const track = result.tracks[0];
    await player.queue.add(track);

    const ms = track.info.duration ?? 0;
    const min = Math.floor(ms / 60000);
    const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    const duration = `${min}:${sec}`;

    if (!player.playing && !player.paused) {
      await player.play({ paused: false });
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🎵 جاري التشغيل")
        .setDescription(`**[${track.info.title}](${track.info.uri})**`)
        .addFields(
          { name: "المدة", value: duration, inline: true },
          { name: "الفنان", value: track.info.author || "غير معروف", inline: true }
        );
      if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
      await interaction.editReply({ embeds: [embed] });
    } else {
      const pos = player.queue.tracks.length;
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("➕ أضيف إلى القائمة")
        .setDescription(`**[${track.info.title}](${track.info.uri})**`)
        .addFields(
          { name: "المدة", value: duration, inline: true },
          { name: "الموضع", value: `#${pos}`, inline: true }
        );
      if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("play error:", msg);
    await interaction.editReply(`❌ حدث خطأ: \`${msg}\``).catch(() => null);
  }
}
