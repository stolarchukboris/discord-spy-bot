const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InviteCreate,
    execute (invite) {

        let inviteExp = Math.round(invite.expiresTimestamp / 1000);

        if (inviteExp > Math.round(invite.createdTimestamp / 1000)) {inviteExp = `<t:${inviteExp}:f>`}
        else {inviteExp = `Doesn't expire`}

        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`A new invite link has been generated!`)
            .setDescription(`Inviter: <@${invite.inviter.id}>\nCreated: <t:${Math.round(invite.createdTimestamp / 1000)}:f>\nExpires: ${inviteExp}\nInvite code: ${invite.code}\nInvite link: ${invite.url}`)
            .setTimestamp()
            .setFooter({ text: `Spy Moderation Module`});

        const channel = invite.guild.channels.cache.find(channel => channel.name === 'server-logs');

        channel.send({ embeds: [embed] });
    },
};