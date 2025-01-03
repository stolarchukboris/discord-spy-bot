const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about this server.'),
	async execute(interaction) {
		const mbed = new EmbedBuilder()
			.setColor(Colors.Blurple)
			.setTitle('Server information.')
			.setDescription('Get information about the server.')
			.setThumbnail(`${await interaction.guild.iconURL()}`)
			.addFields(
				{ name: 'Server name:', value: `${interaction.guild.name}`, inline: true },
				{ name: 'Server owner:', value: `<@${interaction.guild.ownerId}>`, inline: true },
				{ name: 'Created:', value: `<t:${Math.round(interaction.guild.createdTimestamp / 1000)}:f>`, inline: true },
				{ name: 'Member count:', value: `${interaction.guild.memberCount}`, inline: true },
				{ name: 'Server boosts:', value: `${interaction.guild.premiumSubscriptionCount ?? 0}`, inline: true },
				{ name: 'Maximum server bitrate:', value: `${interaction.guild.maximumBitrate}`, inline: true },
				{ name: 'Server description:', value: `${interaction.guild.description ?? 'No description provided.'}` }
			)
			.setTimestamp()
			.setFooter({ text: 'Spy' });

		return await interaction.reply({ embeds: [mbed] });
	},
};