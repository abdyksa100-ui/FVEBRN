import { Interaction, EmbedBuilder } from "discord.js";
import type { BotClient } from "../types.js";

export const name = "interactionCreate";
export const once = false;

export async function execute(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const client = interaction.client as BotClient;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: "❌ هذا الأمر غير موجود!",
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ خطأ في الأمر ${interaction.commandName}:`, err);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setDescription("❌ حدث خطأ أثناء تنفيذ هذا الأمر.");

    if (interaction.replied || interaction.deferred) {
      await interaction
        .followUp({ embeds: [errorEmbed], ephemeral: true })
        .catch(() => null);
    } else {
      await interaction
        .reply({ embeds: [errorEmbed], ephemeral: true })
        .catch(() => null);
    }
  }
}
