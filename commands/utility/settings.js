const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('@mysql/xdevapi');
const { db_config } = require('../../db_config');

const choices = [
    { name: 'Server logs channel ID', value: 'serverLogsChannelSetting' },
    { name: 'Starbord channel ID', value: 'starboardChannelSetting' },
    { name: 'Starboard reactions minimum', value: 'starboardReactionsMin' },
    { name: 'Starboard react to own messages?', value: 'starboardReactToOwnMsgs' }
];

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
                        .setDescription('The name of the setting to be altered.')
                        .addChoices(choices)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('value')
                        .setDescription('Set a value for the setting.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear a certain setting.')
                .addStringOption(option =>
                    option
                        .setName('setting')
                        .setDescription('The name of the setting to be cleared.')
                        .addChoices(choices)
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            await mysql.getSession(db_config)
                .then(async session => {
                    if (interaction.options.getSubcommand() === 'alter') {
                        const setting = interaction.options.getString('setting', true);
                        const settingValue = interaction.options.getString('value', true);

                        await session.sql(`insert into ${setting} values (${interaction.guild.id}, ${settingValue}) on duplicate key update settingValue = ${settingValue};`).execute()

                        await interaction.followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0x00FF00)
                                    .setTitle('Setting updated.')
                                    .setDescription(`Setting \`${setting}\` has been successfully set to \`${settingValue}\`.`)
                                    .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                                    .setTimestamp()
                                    .setFooter({ text: 'Spy Configuration' })
                            ]
                        });
                    } else if (interaction.options.getSubcommand() === 'clear') {
                        const setting = interaction.options.getString('setting', true);

                        await session.sql(`delete from ${setting} where guildId = ${interaction.guild.id};`).execute();

                        await interaction.followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0x00FF00)
                                    .setTitle('Setting cleared.')
                                    .setDescription(`Setting \`${setting}\` has been successfully cleared.`)
                                    .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                                    .setTimestamp()
                                    .setFooter({ text: 'Spy Configuration' })
                            ]
                        });
                    }
                    return await session.close();
                })
        } catch (error) {
            console.error(error);
            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('Error.')
                        .setDescription('An error has occured while executing this command.')
                        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                        .setTimestamp()
                        .setFooter({ text: 'Spy Configuration' })
                ]
            });
        }
    },
};