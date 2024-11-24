const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const channelId = process.env.STARS_CH_ID;

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(messageReaction) {
		
		if (messageReaction.emoji.name === '⭐' && messageReaction.count >= 1 && messageReaction.message.channel.name !== 'stars') {
			const channel = messageReaction.client.channels.cache.get(channelId);
			let desc;

			if (typeof messageReaction.message.content === 'string') {
				desc = messageReaction.message.content;
			} else {
				desc = '';
			}

            const embed = new EmbedBuilder()
				.setColor(0xFFAC33)
				.setAuthor({ name: messageReaction.message.author.username, iconURL: messageReaction.message.author.avatarURL() })
				.setDescription(`[**Jump to message**](${messageReaction.message.url})\n\n${desc}`)
				.setTimestamp()
				.setFooter({ text: 'Spy' })

			let files = [];

			try {
				messageReaction.message.attachments.each(
					attachment => {
						const file = new AttachmentBuilder(attachment.url);
						files.push(file);
					}
				);
			} catch (error) {
				console.error(error);
			}

			channel.send({ content: `${messageReaction.message.channel.url} | ${messageReaction.count} :star:`, embeds: [embed] });

			if (files.length !== 0) {
				channel.send({ files: files });
			}
        }
	},
};