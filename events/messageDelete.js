import { Events, EmbedBuilder, AttachmentBuilder, InteractionCallback } from 'discord.js';

export const name = Events.MessageDelete;
export async function execute(message) {
    const session = message.client.session;
    const result = await session.sql(`select settingValue from serverLogsChannelSetting where guildId = ${message.guild.id};`).execute();
    const logsChannelId = result.fetchOne()[0];
    const embed = new EmbedBuilder()
        .setColor(16743034)
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
        await channel.send({ files: files });
    }
    return;
};