import { Events, EmbedBuilder } from 'discord.js';

export const name = Events.InviteDelete;
export async function execute(invite) {
    const knex = await invite.client.knex;
    const setting = await knex('serverLogsChannelSetting')
        .select('*')
        .where('guildId', invite.guild.id)
        .first();
    
    if (!setting) return;

    const logsChannelId = setting.settingValue;
    const embed = new EmbedBuilder()
        .setColor(16743034)
        .setTitle(`Invite has been deleted.`)
        .setDescription(`Invite code: ${invite.code}\nInvite link: ${invite.url}`)
        .setTimestamp()
        .setFooter({ text: `Spy Moderation` });

    const channel = await invite.guild.channels.cache.get(logsChannelId);

    return await channel.send({ embeds: [embed] });
};