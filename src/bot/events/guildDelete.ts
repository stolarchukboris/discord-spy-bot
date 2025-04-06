import { Guild } from "discord.js";
import spyBot from "../../index.js";

export default async (guild: Guild) => {
    try {
        const knex = spyBot.knex;

        for (const setting of spyBot.settings) {
            await knex<settingInfo>(setting.value)
                .del()
                .where('guildId', guild.id);
        }

        await knex<eventInfo>('communityEvents')
            .del()
            .where('guildId', guild.id);
    } catch (error) {
        console.error(error);
    }
}
