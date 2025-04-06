import spyBot, { botState } from '../../index.js';
import { ActivityType, Guild } from 'discord.js';
import eventReminder from '../../misc/worker.js';

export default async () => {
    console.log('Spy Bot Ready!');
    spyBot.state = botState.ON;

    spyBot.bot.user?.setPresence({
        status: 'dnd',
        activities: [{ name: 'TypeScript tutorials.', type: ActivityType.Watching }]
    });

    try {
        const guild = spyBot.bot.guilds.cache.get(spyBot.env.GUILD_ID) as Guild;
        guild.channels.cache.each(async (channel) => {
            if (channel.type === 0) {
                const fetchedChannel = await channel.fetch();
                await fetchedChannel.messages.fetch();
            }
        });
    } catch (error) {
        console.error(error);
    }

    while (true) {
        await eventReminder();

        await new Promise(resolve => setTimeout(resolve, 1_000));
    }
}
