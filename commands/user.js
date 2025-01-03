import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('user')
	.setDescription('Provides information about the specified user.')
	.addUserOption(option => option
		.setName('user')
		.setDescription('Username or User ID to fetch. Ignore to get info on yourself.'));
export async function execute(interaction) {
	const opt = interaction.options.getUser('user') ?? interaction.user;

	const mbed = new EmbedBuilder()
		.setColor(Colors.Blurple)
		.setTitle('Server member information.')
		.setDescription(`Get information about ${opt}.`)
		.setThumbnail(`${opt.avatarURL()}`)
		.addFields(
			{ name: 'Username:', value: `${opt.username}`, inline: true },
			{ name: 'Join date:', value: `<t:${parseInt(interaction.member.joinedTimestamp / 1000)}:f>`, inline: true },
			{ name: 'ID:', value: `${opt.id}`, inline: true }
		)
		.setTimestamp()
		.setFooter({ text: 'Spy' });

	return await interaction.reply({ embeds: [mbed] });
}