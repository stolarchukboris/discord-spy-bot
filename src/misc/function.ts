import { EmbedBuilder, Colors, ChatInputCommandInteraction, TextChannel, ColorResolvable } from 'discord.js';
import { spyBot } from '../index.js';
import logos from './logos.js';

export const eventReminder = async (spyBot: spyBot) => {
    try {
        const channel: TextChannel = spyBot.bot.channels.cache.get('1268223384307634263') as TextChannel;
        if (!channel.isTextBased()) return;

        const now = Math.floor(Date.now() / 1000);
        const tenMinutesFromNow = now + 10 * 60;
        const event = await spyBot.knex<eventInfo>('communityEvents')
            .select('*')
            .where('eventTime', '>=', now)
            .andWhere('eventTime', '<=', tenMinutesFromNow)
            .first();

        if (!event) return;
        if (event.reminded) return;

        const eventId = event.eventId;
        const hostId = event.eventHost;
        const gameName = event.eventGameName;
        const thumbnail = event.gameThumbnailUrl;

        await channel.send({
            content: `<@${hostId}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle('Event Reminder')
                    .setDescription(`Your scheduled event in ${gameName} is starting in 10 minutes.
Please make sure you are ready for the event!
If you cannot host the event, please use </events cancel:1331375015626801256> command.`)
                    .setFields({ name: 'Event ID', value: `${eventId} ` })
                    .setThumbnail(thumbnail)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });

        return await spyBot.knex<eventInfo>('communityEvents')
            .update({ reminded: true })
            .where('eventId', eventId);
    } catch (error) {
        console.error(error);
    }
};

/**
 * Error send options.
 * 
 * @param {boolean} editReply (optional, defaults to `true`) If the interaction if deferred, whether to edit a reply or to send a follow up to it.
 * @param {string} errorMessage (optional, defaults to `An error has occured while executing this command.`) A message to be displayed in the embed description.
 * @param {ColorResolvable} embedColor (optional, defaults to `Colors.Red`) An embed color to use.
 * @param {string} embedThumbnail (optional, defaults to `logos.failure`) An embed thumbnail to use.
 */
interface sendErrorOptions {
    editReply?: boolean;
    errorMessage?: string;
    embedColor?: ColorResolvable;
    embedThumbnail?: string;
}

/**
 * Sends an error embed.
 *
 * @param {sendErrorOptions} options (optional) Error sending options.
 * 
 * @returns An error embed message response.
 */
export const sendError = async (interaction: ChatInputCommandInteraction, options?: sendErrorOptions) => {
    const embed = new EmbedBuilder()
        .setColor(options?.embedColor ?? Colors.Red)
        .setTitle('Error.')
        .setDescription(options?.errorMessage ?? 'An error has occured while executing this command.')
        .setThumbnail(options?.embedThumbnail ?? logos.warning)
        .setTimestamp()
        .setFooter({ text: 'Spy' })

    if (!interaction.deferred) {
        return await interaction.reply({ embeds: [embed] });
    }

    if (options?.editReply) {
        return await interaction.editReply({ embeds: [embed] });
    } else {
        return await interaction.followUp({ embeds: [embed] });
    }
}