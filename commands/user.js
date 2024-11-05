const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the specified user.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Username or User ID to fetch. Ignore to get info on yourself.')),

	async execute(interaction) {
		let opt = interaction.options.getUser('user');
		if (opt === null) {opt = interaction.user}
		const mbed = new EmbedBuilder()
            .setColor(0xAAAAFF)
            .setTitle('Server member information.')
            .setDescription(`Get information about ${opt}.`)
			.setThumbnail(`${opt.avatarURL()}`)
			.addFields(
				{name: 'Username:', value: `${opt.username}`, inline: true},
				{name: 'Join date:', value: `<t:${parseInt(interaction.member.joinedTimestamp/1000)}:f>`, inline: true},
				{name: 'ID:', value: `${opt.id}`, inline: true}
			)
            .setTimestamp()
            .setFooter({ text: 'Spy'});

        await interaction.reply({embeds: [mbed]});
	},
};