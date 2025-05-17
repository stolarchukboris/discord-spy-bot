import { EmbedBuilder, AttachmentBuilder, MessageReaction, User, Message, TextChannel } from "discord.js";
import spyBot from "../../index.js";

export default async (messageReaction: MessageReaction) => {
    try {
        if (messageReaction.partial) {
            await messageReaction.fetch();

            if (messageReaction.message.partial) await messageReaction.message.fetch();
        }

        const knex = spyBot.knex;
        const channelSetting = await knex<settingInfo>('starboardChannelSetting')
            .select('*')
            .where('guildId', messageReaction.message.guildId)
            .first();

        if (!channelSetting) return;

        const channelId = channelSetting.settingValue as string;
        const minReactionsSetting = await knex<settingInfo>('starboardReactionsMin')
            .select('*')
            .where('guildId', messageReaction.message?.guildId)
            .first();

        if (!minReactionsSetting) return;

        const minReactions = minReactionsSetting.settingValue as number;

        if (messageReaction.emoji.name === '⭐' && messageReaction.count >= minReactions && messageReaction.message.channel.id !== channelId) {
            const channel = messageReaction.client.channels.cache.get(channelId) as TextChannel;
            if (!channel.isTextBased()) return;

            let desc: string;

            typeof messageReaction.message.content === 'string' ? desc = messageReaction.message.content : desc = '';

            let files: AttachmentBuilder[] = [];

            messageReaction.message.attachments.each(attachment => {
                const file = new AttachmentBuilder(attachment.url);
                files.push(file);
            });

            const message = await knex<starboardMessage>('starboardMessages')
                .select('*')
                .where('originMessage', `${messageReaction.message.id}`)
                .first();

            if (!message) {
                const msg = await channel.send({
                    content: `${messageReaction.message.channel.url} | ${messageReaction.count} :star:`,
                    embeds: [
                        new EmbedBuilder()
                            .setColor(16755763)
                            .setAuthor({ name: (messageReaction.message.author as User).username, iconURL: (messageReaction.message.author as User).avatarURL() as string })
                            .setDescription(`[**Jump to message**](${messageReaction.message.url})\n\n${desc}`)
                            .setTimestamp()
                            .setFooter({ text: 'Spy' })
                    ]
                });
                const reactSetting = await knex<settingInfo>('starboardReactToOwnMsgs')
                    .select('*')
                    .where('guildId', messageReaction.message.guildId)
                    .first();
                let react = 0;
                if (reactSetting) react = 1;

                if (react === 1) await msg.react('⭐');

                if (files.length !== 0) await channel.send({ files: files });

                await knex<starboardMessage>('starboardMessages')
                    .insert({
                        originMessage: messageReaction.message.id,
                        starboardMessage: msg.id,
                        amountOfReactions: messageReaction.count
                    });
            } else {
                await knex<starboardMessage>('starboardMessages')
                    .update({ amountOfReactions: messageReaction.count })
                    .where('originMessage', messageReaction.message.id);

                const message = await knex<starboardMessage>('starboardMessages')
                    .select('*')
                    .where('originMessage', messageReaction.message.id)
                    .first();

                if (!message) return;

                const msgId = message.starboardMessage;
                const msgToEdit = channel.messages.cache.get(msgId) as Message;

                await msgToEdit.edit(`${messageReaction.message.channel.url} | ${messageReaction.count} :star:`);
            }
        }
    } catch (error) {
        console.error(error);
    }
}
