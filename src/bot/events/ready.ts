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

    while (true) {
        await eventReminder();

        await new Promise(resolve => setTimeout(resolve, 1_000));
    }
}
