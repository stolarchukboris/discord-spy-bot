import { EmbedBuilder, Colors } from 'discord.js';

export const eventReminder = async function (client) {
    try {
        const channel = client.channels.cache.get('1268223384307634263');
        const now = Math.floor(Date.now() / 1000);
        const tenMinutesFromNow = now + 10 * 60;
        const event = await client.knex('communityEvents')
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
If you cannot host the event, please use </events cancel:1291413699550122025> command.`)
                    .setFields({ name: 'Event ID', value: `${eventId} `})
                    .setThumbnail(thumbnail)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });

        return await client.knex('communityEvents')
            .update({ reminded: true })
            .where('eventId', eventId);
    } catch (error) {
        console.error(error);
    };
};