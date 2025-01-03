import { Events, EmbedBuilder } from 'discord.js';

export const name = Events.InviteDelete;
export async function execute(invite) {
    const session = invite.client.session;
    const result = await session.sql(`select settingValue from serverLogsChannelSetting where guildId = ${invite.guild.id};`).execute();
    const logsChannelId = result.fetchOne()[0];

    const embed = new EmbedBuilder()
        .setColor(16743034)
        .setTitle(`Invite has been deleted.`)
        .setDescription(`Invite code: ${invite.code}\nInvite link: ${invite.url}`)
        .setTimestamp()
        .setFooter({ text: `Spy Moderation` });

    const channel = invite.guild.channels.cache.get(logsChannelId);

    return await channel.send({ embeds: [embed] });
};