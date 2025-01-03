import { Events, EmbedBuilder, AttachmentBuilder } from 'discord.js';

export const name = Events.MessageReactionAdd;
export async function execute(messageReaction) {
	const session = messageReaction.client.session;
	const channelResult = await session.sql(`select settingValue from starboardChannelSetting where guildId = ${messageReaction.message.guild.id};`).execute();
	const channelId = channelResult.fetchOne()[0];

	if (!channelId) {
		return await session.close();
	};

	const reactionsResult = await session.sql(`select settingValue from starboardReactionsMin where guildId = ${messageReaction.message.guild.id};`).execute();
	const minReactions = reactionsResult.fetchOne()[0] ?? 3;

	if (messageReaction.emoji.name === '⭐' && messageReaction.count >= minReactions && messageReaction.message.channel.id !== channelId) {
		const channel = messageReaction.client.channels.cache.get(channelId);
		let desc;

		if (typeof messageReaction.message.content === 'string') {
			desc = messageReaction.message.content;
		} else {
			desc = '';
		};

		const embed = new EmbedBuilder()
			.setColor(16755763)
			.setAuthor({ name: messageReaction.message.author.username, iconURL: messageReaction.message.author.avatarURL() })
			.setDescription(`[**Jump to message**](${messageReaction.message.url})\n\n${desc}`)
			.setTimestamp()
			.setFooter({ text: 'Spy' });

		let files = [];

		messageReaction.message.attachments.each(
			attachment => {
				const file = new AttachmentBuilder(attachment.url);
				files.push(file);
			}
		);

		const result = await session.sql(`select starboardMessage from starboardMessages where originMessage = ${messageReaction.message.id};`).execute();
		const msgId = result.fetchOne();

		if (!msgId) {
			const msg = await channel.send({ content: `${messageReaction.message.channel.url} | ${messageReaction.count} :star:`, embeds: [embed] });
			const result = await session.sql(`select settingValue from starboardReactToOwnMsgs where guildId = ${messageReaction.message.guild.id};`).execute();
			const react = result.fetchOne()[0];

			if (react === 1) {
				await msg.react('⭐');
			};

			if (files.length !== 0) {
				channel.send({ files: files });
			};

			await session.sql(`insert into starboardMessages values (${messageReaction.message.id}, ${await msg.id}, ${messageReaction.count});`).execute();
		} else {
			await session.sql(`update starboardMessages set amountOfReactions = ${messageReaction.count} where originMessage = ${messageReaction.message.id};`).execute();
			const result = await session.sql(`select starboardMessage from starboardMessages where originMessage = ${messageReaction.message.id};`).execute();
			const msgId = result.fetchOne()[0];
			const msgToEdit = channel.messages.cache.get(msgId);

			await msgToEdit.edit(`${messageReaction.message.channel.url} | ${messageReaction.count} :star:`);
		}
		return;
	};
};