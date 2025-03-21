import { Guild, Invite, EmbedBuilder, TextChannel } from "discord.js";
import { spyBot } from "../../index.js";

export default async (spyBot: spyBot, invite: Invite) => {
    try {
        const knex = spyBot.knex;
        const setting = await knex<settingInfo>('serverLogsChannelSetting')
            .select('*')
            .where('guildId', (invite.guild as Guild).id)
            .first();

        if (!setting) return;

        const logsChannelId = setting.settingValue as string;
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`Invite has been deleted.`)
            .setDescription(`Invite code: ${invite.code}\nInvite link: ${invite.url}`)
            .setTimestamp()
            .setFooter({ text: `Spy Moderation` });

        const channel: TextChannel = (invite.guild as Guild).channels.cache.get(logsChannelId) as TextChannel;
        if (!channel.isTextBased()) return;

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error(error);
    }
    return;
}