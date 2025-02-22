import { EmbedBuilder, Colors, GuildChannel, ChatInputCommandInteraction, Guild, TextChannel } from 'discord.js';
import { spyBot } from '../index.js';
import logos from './logos.js';

export const errorEmbed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle('Error.')
    .setThumbnail(logos.warning)
    .setTimestamp()
    .setFooter({ text: 'Spy' });

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

export const eventCheck = async (spyBot: spyBot, interaction: ChatInputCommandInteraction<"cached">, eventId: string, status?: number) => {
    const event = await spyBot.knex<eventInfo>('communityEvents')
        .select('*')
        .where('eventId', eventId)
        .andWhere('guildId', (interaction.guild as Guild).id)
        .first();

    if (!event) {
        errorEmbed.setDescription(`Event with ID \`${eventId}\` has not been found in the database.`);

        return await interaction.editReply({ embeds: [errorEmbed] });
    }

    if (event.eventStatus === status) {
        switch (status) {
            case 1:
                errorEmbed.setDescription('This event has not been started yet.')

                break;
            case 2:
                errorEmbed.setDescription('This event has already been started.')

                break;
        }
        return await interaction.editReply({ embeds: [errorEmbed] });
    }
    return event;
};

export const sendError = async (interaction: ChatInputCommandInteraction<'cached'>, errorMessage: string) => {
    return await interaction.editReply({ embeds: [errorEmbed.setDescription(errorMessage)] });
};