import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const eventReminder = async function (client) {
    try {
        const channel = client.channels.cache.get('1268223384307634263');
        const now = Math.floor(Date.now() / 1000);
        const tenMinutesFromNow = now + 10 * 60;
        const eventsCheck = await client.session.sql(`select * from communityEvents where eventTime >= '${now}' and eventTime <= '${tenMinutesFromNow}' and eventStatus = 1 and reminded = 0;`).execute();

        if (!eventsCheck) return;

        console.log(await eventsCheck.fetchAll());
    } catch (error) {
        console.error(error);
    };
};