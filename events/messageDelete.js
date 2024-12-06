const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const mysql = require('@mysql/xdevapi');
const { db_config } = require('../db_config');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        const session = mysql.getSession(db_config)
            .then(async session => {
                await session.sql(`select settingValue from serverLogsChannelSetting where guildId = ${message.guild.id};`).execute()
                    .then(async result => {
                        const logsChannelId = result.fetchOne()[0];
                        const embed = new EmbedBuilder()
                            .setColor(0xff7a7a)
                            .setTitle(`Message deleted from ${message.channel.url}`)
                            .setDescription(`**Created on <t:${Math.round(message.createdTimestamp / 1000)}:d> <t:${Math.round(message.createdTimestamp / 1000)}:t> by <@${message.author.id}>**:\n${message.content}`)
                            .setTimestamp()
                            .setFooter({ text: `Spy Moderation` });

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

                        const channel = message.guild.channels.cache.get(logsChannelId);

                        await channel.send({ embeds: [embed] });

                        if (files.length !== 0) {
                            channel.send({ files: files });
                        }

                        return await session.close();
                    })
                    .catch(async error => {
                        console.error(error);

                        return await session.close();
                    });
            })
            .catch(async error => {
                console.error(error);
            });
    }
};