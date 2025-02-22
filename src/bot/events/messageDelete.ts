import { EmbedBuilder, Message, AttachmentBuilder, Guild, Colors, TextChannel } from "discord.js";
import { spyBot } from "../../index.js";

export default async (spyBot: spyBot, message: Message) => {
    try {
        const knex = spyBot.knex;
        const setting = await knex<settingInfo>('serverLogsChannelSetting')
            .select('*')
            .where('guildId', message.guildId)
            .first();

        if (!setting) return;

        const logsChannelId = setting.settingValue as string;
        const embed = new EmbedBuilder()
            .setColor(Colors.LuminousVividPink)
            .setTitle(`Message deleted from ${message.channel.url}`)
            .setDescription(`**Created on <t:${Math.round(message.createdTimestamp / 1000)}:d> <t:${Math.round(message.createdTimestamp / 1000)}:t> by <@${message.author.id}>**:\n${message.content}`)
            .setTimestamp()
            .setFooter({ text: `Spy Moderation` });

        let files: AttachmentBuilder[] = [];

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

        const channel: TextChannel = (message.guild as Guild).channels.cache.get(logsChannelId) as TextChannel;
        if (!channel.isTextBased()) return;

        await channel.send({ embeds: [embed] });

        if (files.length !== 0) {
            await channel.send({ files: files });
        }
    } catch (error) {
        console.error(error);
    }
    return;
}