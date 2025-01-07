import { Events, EmbedBuilder } from 'discord.js';

export const name = Events.InviteCreate;
export async function execute(invite) {
    const knex = await invite.client.knex;
    const setting = await knex('serverLogsChannelSetting')
        .select('*')
        .where('guildId', invite.guild.id)
        .first();

    if (!setting) return;

    const logsChannelId = setting.settingValue;

    let inviteExp = Math.round(invite.expiresTimestamp / 1000);

    if (inviteExp > Math.round(invite.createdTimestamp / 1000)) { inviteExp = `<t:${inviteExp}:f>`; }
    else { inviteExp = `Doesn't expire` };

    const embed = new EmbedBuilder()
        .setColor(2829617)
        .setTitle(`A new invite link has been generated!`)
        .setDescription(`Inviter: <@${invite.inviter.id}>\nCreated: <t:${Math.round(invite.createdTimestamp / 1000)}:f>\nExpires: ${inviteExp}\nInvite code: ${invite.code}\nInvite link: ${invite.url}`)
        .setTimestamp()
        .setFooter({ text: `Spy Moderation` });

    const channel = await invite.guild.channels.cache.get(logsChannelId);

    return await channel.send({ embeds: [embed] });
};