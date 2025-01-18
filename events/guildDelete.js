import { Events } from 'discord.js';
import settingsEnum from '../misc/settingsEnum.js';

export const name = Events.GuildDelete;
export async function execute(guild) {
    const knex = guild.client.knex;

    for (const setting of settingsEnum) {
        await knex(setting.value)
            .del()
            .where('guildId', guild.id);
    };

    await knex('communityEvents')
        .del()
        .where('guildId', guild.id);

    return;
};