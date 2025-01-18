import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import logos from '../../misc/logos.js';

export const category = 'utility';
export const data = new SlashCommandBuilder()
    .setName('reboot')
    .setDescription('[DEV] Reboot the bot.');
export async function execute(interaction) {
    await interaction.deferReply();
    const ownerId = process.env.OWNER_ID;

    if (interaction.user.id === ownerId) {
        const mbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(`Bot is rebooting...`)
            .setDescription(`Bot reboot is in progress. Please wait...`)
            .setThumbnail(logos.checkmark)
            .setTimestamp()
            .setFooter({ text: 'Spy' });

        await interaction.editReply({ embeds: [mbed] });
        return process.exit();
    } else {
        const mbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`Error.`)
            .setDescription(`You are not authorized to run this command.`)
            .setThumbnail(logos.warning)
            .setTimestamp()
            .setFooter({ text: 'Spy' });

        return await interaction.editReply({ embeds: [mbed] });
    }
}