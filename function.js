import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const eventReminder = async function (client) {
    try {
        const channel = client.channels.cache.get('1268223384307634263');
        const now = Math.floor(Date.now() / 1000);
        const tenMinutesFromNow = now + 10 * 60;
        const eventsCheck = await client.session.sql(`select * from communityEvents where eventTime >= '${now}' and eventTime <= '${tenMinutesFromNow}' and eventStatus = 1 and reminded = 0;`).execute();
        const event = await eventsCheck.fetchOne();

        if (!event) return;

        const eventId = event[0];
        const hostId = event[1];
        const gameName = event[3];
        const thumbnail = event[4];

        await channel.send({
            content: `<@${hostId}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle('Event Reminder')
                    .setDescription(`You scheduled event in ${gameName} is starting in 10 minutes.
Please make sure you are ready for the event!
If you cannot host the event, please use </events cancel:1291413699550122025> command.`)
                    .setFields({ name: 'Event ID', value: `${eventId} `})
                    .setThumbnail(thumbnail)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });

        return await client.session.sql(`update communityEvents set reminded = 1 where eventId = '${eventId}';`).execute();
    } catch (error) {
        console.error(error);
    };
};