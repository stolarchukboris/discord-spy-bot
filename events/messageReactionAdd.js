import { Events, EmbedBuilder, AttachmentBuilder } from 'discord.js';

export const name = Events.MessageReactionAdd;
export async function execute(messageReaction) {
	const knex = await messageReaction.client.knex;
	const channelSetting = await knex('starboardChannelSetting')
		.select('*')
		.where('guildId', messageReaction.message.guildId)
		.first();

	if (!channelSetting) return;

	const channelId = channelSetting.settingValue;
	const minReactionsSetting = await knex('starboardReactionsMin')
		.select('*')
		.where('guildId', messageReaction.message.guildId)
		.first();
	const minReactions = minReactionsSetting.settingValue ?? 3;

	if (messageReaction.emoji.name === '⭐' && messageReaction.count >= minReactions && messageReaction.message.channel.id !== channelId) {
		const channel = await messageReaction.client.channels.cache.get(channelId);
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

		const message = await knex('starboardMessages')
			.select('*')
			.where('originMessage', `${messageReaction.message.id}`)
			.first();

		if (!message) {
			const msg = await channel.send({
				content: `${messageReaction.message.channel.url} | ${messageReaction.count} :star:`,
				embeds: [embed]
			});
			const reactSetting = await knex('starboardReactToOwnMsgs')
				.select('*')
				.where('guildId', messageReaction.message.guildId)
				.first();
			let react = 0;
			if (reactSetting) react = 1;

			if (react === 1) {
				await msg.react('⭐');
			};

			if (files.length !== 0) {
				await channel.send({ files: files });
			};

			await knex('starboardMessages')
				.insert({
					originMessage: messageReaction.message.id,
					starboardMessage: await msg.id,
					amountOfReactions: messageReaction.count
				});
		} else {
			await knex('starboardMessages')
				.update({ amountOfReactions: messageReaction.count })
				.where('originMessage', messageReaction.message.id);

			const message = await knex('starboardMessages')
				.select('*')
				.where('originMessage', messageReaction.message.id)
				.first();
			const msgId = message.starboardMessage;
			const msgToEdit = await channel.messages.cache.get(msgId);

			await msgToEdit.edit(`${messageReaction.message.channel.url} | ${messageReaction.count} :star:`);
		}
		return;
	};
};