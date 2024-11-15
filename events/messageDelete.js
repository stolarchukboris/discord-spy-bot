const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    execute (message) {
        const embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`Message deleted from ${message.channel.url}`)
            .setDescription(`**Created on <t:${Math.round(message.createdTimestamp / 1000)}:d> <t:${Math.round(message.createdTimestamp / 1000)}:t> by <@${message.author.id}>**:\n${message.content}`)
            .setTimestamp()
            .setFooter({ text: `Spy Moderation Module`});

        const channel = message.guild.channels.cache.find(channel => channel.name === 'server-logs');

        channel.send({ embeds: [embed] });
    },
};