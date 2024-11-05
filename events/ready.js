const { Events, EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		const webhookClient = new WebhookClient({ url: "https://discord.com/api/webhooks/1276292302402355211/7eFiBnh8ilh2qn61WhEbsfWtzxyz7OhX5vY6ALjxTG-riwhpqFxo39Kqdj2ziEfBXxWf" });

		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setPresence({ activities: [{ name: `on 47-AK's nerves` }], status: 'dnd' });

		const embed = new EmbedBuilder()
			.setTitle('Spy is now working.')
			.setColor(0x00FF00)
			.setDescription(`Websocket heartbeat: ${client.ws.ping} ms.`)
			.setThumbnail('https://gas-kvas.com/grafic/uploads/posts/2024-01/gas-kvas-com-p-znak-serdtsa-na-prozrachnom-fone-44.png')
			.setTimestamp()
			.setFooter({ text: 'Spy'});

		webhookClient.send({
			embeds: [embed],
		});
	},
};