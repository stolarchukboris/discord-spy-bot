const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		const mbed = new EmbedBuilder()
            .setColor(0xAAAAFF)
            .setTitle('Server information.')
            .setDescription('Get information about the server.')
            .setThumbnail(`${await interaction.guild.iconURL()}`)
			.addFields(
				{name: 'Server name:', value: `${interaction.guild.name}`, inline: true},
				{name: 'Server owner:', value: `<@${interaction.guild.ownerId}>`, inline: true},
				{name: 'Member count:', value: `${interaction.guild.memberCount}`}
			)
            .setTimestamp()
            .setFooter({ text: 'Spy'});

        await interaction.reply({embeds: [mbed]});
	},
};