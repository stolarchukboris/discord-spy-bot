const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('@mysql/xdevapi');
const { db_config } = require('../../db_config');

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
                            { name: 'Server logs channel ID', value: 'serverLogsChannelSetting' },
                            { name: 'Starbord channel ID', value: 'starboardChannelSetting' }
                        )
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('value')
                        .setDescription('Set a value for the setting.')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error.')
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
            .setTimestamp()
            .setFooter({ text: 'Spy Configuration' });

        mysql.getSession(db_config)
            .then(async session => {
                if (interaction.options.getSubcommand() === 'alter') {
                    const setting = interaction.options.getString('setting', true);
                    const settingValue = interaction.options.getString('value', true);

                    await session.sql(`insert into ${setting} values (${interaction.guild.id}, ${settingValue}) on duplicate key update settingValue = ${settingValue};`).execute()
                        .then(async _ => {
                            const embed = new EmbedBuilder()
                                .setColor(0x00FF00)
                                .setTitle('Setting updated.')
                                .setDescription(`Setting \`${setting}\` has been successfully set to \`${settingValue}\`.`)
                                .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                                .setTimestamp()
                                .setFooter({ text: 'Spy Configuration' });

                            await interaction.followUp({ embeds: [embed] });
                        })
                        .catch(async error => {
                            console.error(error);

                            errorEmbed.setDescription(`${error}`);

                            await interaction.followUp({ embeds: [errorEmbed] });
                            return await session.close();
                        });
                }
                return await session.close();
            })
            .catch(async error => {
                console.error(error);

                errorEmbed.setDescription(`${error}`);

                await interaction.followUp({ embeds: [errorEmbed] });
            });
    },
};