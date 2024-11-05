const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.GuildScheduledEventUpdate,
	async execute(oldEvent, newEvent) {
		if (newEvent.status === 2) {
            const embed = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setTitle(`The scheduled ${newEvent.name} is starting now!`)
                .setDescription(`The scheduled ${newEvent.name} is starting now!`)
                .setThumbnail(newEvent.coverImageURL())
                .setTimestamp()
                .setFooter({ text: `Spy · Event ID: ${newEvent.id}`});

            const channel = newEvent.client.channels.cache.find(channel => channel.name === 'event-announcements');

            channel.send({ content: `<@&1289909425368338505>`, embeds: [embed] });
        }
	},
};