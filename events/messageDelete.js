import { Events, EmbedBuilder, AttachmentBuilder } from 'discord.js';

export const name = Events.MessageDelete;
export async function execute(message) {
    const knex = await message.client.knex;
    const setting = await knex('serverLogsChannelSetting')
        .select('*')
        .where('guildId', message.guildId)
        .first();
    
    if (!setting) return;

    const logsChannelId = setting.settingValue;
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

    const channel = await message.guild.channels.cache.get(logsChannelId);

    await channel.send({ embeds: [embed] });

    if (files.length !== 0) {
        await channel.send({ files: files });
    }
    return;
};