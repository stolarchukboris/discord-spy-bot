const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    execute (message) {
        let embed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`Message deleted from ${message.channel.url}`)
            .setDescription(`**Created on <t:${Math.round(message.createdTimestamp / 1000)}:d> <t:${Math.round(message.createdTimestamp / 1000)}:t> by <@${message.author.id}>**:\n${message.content}`)
            .setTimestamp()
            .setFooter({ text: `Spy Moderation Module`});

        let files = [];

        try {
            message.attachments.each(
                attachment => {
                    const file = new AttachmentBuilder(attachment.url);
                    files.push(file);
                }
            );
        } catch (error) {
            console.error(error);
        }

        const channel = message.guild.channels.cache.find(channel => channel.name === 'server-logs');

        channel.send({ embeds: [embed] });

        if (files.length !== 0) {
            channel.send({ files: files });
        }
    },
};