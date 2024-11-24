const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ownerId = process.env.OWNER_ID;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('msg')
		.setDescription('Send a message to the channel.')
        .addStringOption(option =>
            option
                .setName('channel_id')
                .setDescription('ID of the channel you want to send the message to.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message itself.')
                .setRequired(true)
        ),
	async execute(interaction) {
		if (interaction.user.id === ownerId) {
            const id = interaction.options.getString('channel_id', true);
            const content = interaction.options.getString('message', true);

            const channel = interaction.client.channels.cache.get(id);
            
            channel.send(content);
            await interaction.reply({ content: 'Sent!', ephemeral: true })
        } else {
            const mbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`Error.`)
                .setDescription(`You are not authorized to run this command.`)
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                .setTimestamp()
                .setFooter({ text: 'Spy' });

            await interaction.reply({ embeds: [mbed] });
        }
	},
};