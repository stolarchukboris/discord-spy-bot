const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check the websocket heartbeat.'),
	async execute(interaction) {
		const mbed = new EmbedBuilder()
			.setColor(0x00FF00)
			.setTitle(`ponggggggggg gg g ggg g!`)
			.setDescription(`Websocket heartbeat: ${interaction.client.ws.ping} ms.`)
			.setThumbnail('https://gas-kvas.com/grafic/uploads/posts/2024-01/gas-kvas-com-p-znak-serdtsa-na-prozrachnom-fone-44.png')
			.setTimestamp()
			.setFooter({ text: 'Spy' });

		return await interaction.reply({ embeds: [mbed] });
	},
};
