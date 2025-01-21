import { spyBot, botState } from '../../index.js';
import { ActivityType, Client } from 'discord.js';

export default (spyBot: spyBot) => {
    console.log('Spy Bot Ready!');
    spyBot.state = botState.ON;

    spyBot.bot.user?.setPresence({
        status: 'dnd',
        activities: [{ name: 'TypeScript documentation.', type: ActivityType.Watching }]
    });
}