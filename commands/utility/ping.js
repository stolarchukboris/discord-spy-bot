import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const category = 'utility';
export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Check the websocket heartbeat.');
export async function execute(interaction) {
	await interaction.deferReply();

	const mbed = new EmbedBuilder()
		.setColor(Colors.Green)
		.setTitle(`Pong!`)
		.setDescription(`Websocket heartbeat: ${interaction.client.ws.ping} ms.`)
		.setThumbnail('https://gas-kvas.com/grafic/uploads/posts/2024-01/gas-kvas-com-p-znak-serdtsa-na-prozrachnom-fone-44.png')
		.setTimestamp()
		.setFooter({ text: 'Spy' });

	return await interaction.editReply({ embeds: [mbed] });
}
