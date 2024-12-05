const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('@mysql/xdevapi');
const db_config = {
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    host: 'localhost',
    port: 33060,
    schema: process.env.DB_SCHEMA
}

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Manage bot settings on this server.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('alter')
                .setDescription('Alter a certain setting.')
                .addStringOption(option =>
                    option
                        .setName('setting')
                        .setDescription('The name of the setting to alter.')
                        .addChoices(
                            { name: 'Server logs channel ID', value: 'serverLogsChannelSetting' }
                        )
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('value')
                        .setDescription('Set a value for the setting.')
                        .setRequired(true)
                )
        ),
	async execute(interaction) {
        await interaction.deferReply();

		const session = mysql.getSession(db_config)
            .then(async session => {
                if (interaction.options.getSubcommand() === 'alter') {
                    const setting = interaction.options.getString('setting', true);
                    const settingValue = interaction.options.getString('value', true);

                    await session.sql(`insert into ${setting} values (${interaction.guild.id}, ${settingValue});`).execute()
                        .then(async _ => {
                            const embed = new EmbedBuilder()
                                .setColor(0x00FF00)
                                .setTitle('Setting updated.')
                                .setDescription(`Setting ${setting} has been successfully set to ${settingValue}.`)
                                .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                                .setTimestamp()
                                .setFooter({ text: 'Spy Configuration' });
                                
                            await interaction.followUp({ embeds: [embed] });
                        })
                }
            })
	},
};