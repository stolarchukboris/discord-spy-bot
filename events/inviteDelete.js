const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InviteDelete,
    execute (invite) {
        const channel = invite.guild.channels.cache.find(channel => channel.name === 'server-logs');

        const embed = new EmbedBuilder()
            .setColor(0xff7a7a)
            .setTitle(`Invite has been deleted.`)
            .setDescription(`Invite code: ${invite.code}\nInvite link: ${invite.url}`)
            .setTimestamp()
            .setFooter({ text: `Spy Moderation Module`});

        channel.send({ embeds: [embed]});
    },
};