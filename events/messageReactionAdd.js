const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const channelId = process.env.STARS_CH_ID;
const mysql = require('@mysql/xdevapi');

const db_config = {
	password: process.env.DB_PASS,
    user: process.env.DB_USER,
    host: 'localhost',
    port: 33060,
    schema: process.env.DB_SCHEMA
}

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

			mysql.getSession(db_config)
				.then(async session => {
					try {
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

						await session.sql(`select starboardMessage from starboardMessages where originMessage = ${messageReaction.message.id};`).execute()
							.then(async result => {
								const msgId = result.fetchOne();

								if (msgId === undefined) {
									msg = await channel.send({ content: `${messageReaction.message.channel.url} | ${messageReaction.count} :star:`, embeds: [embed] });

									if (files.length !== 0) {
										channel.send({ files: files });
									}

									await session.sql(`insert into starboardMessages values (${messageReaction.message.id}, ${await msg.id}, ${messageReaction.count});`).execute();
								} else {
									await session.sql(`update starboardMessages set amountOfReactions = ${messageReaction.count} where originMessage = ${messageReaction.message.id};`).execute();
									await session.sql(`select starboardMessage from starboardMessages where originMessage = ${messageReaction.message.id};`).execute()
										.then(async result => {
											const msgId = result.fetchOne()[0];
											const msgToEdit = channel.messages.cache.get(msgId);

											await msgToEdit.edit(`${messageReaction.message.channel.url} | ${messageReaction.count} :star:`);
										});
								}
							});
					} catch (error) {
						console.error(error);
					} finally {
						return await session.close();
					};
				})
        }
	},
};