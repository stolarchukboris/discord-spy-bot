import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

const choices = [
    { name: 'Server logs channel ID', value: 'serverLogsChannelSetting' },
    { name: 'Starbord channel ID', value: 'starboardChannelSetting' },
    { name: 'Starboard reactions minimum', value: 'starboardReactionsMin' },
    { name: 'Starboard react to own messages?', value: 'starboardReactToOwnMsgs' }
];

export const category = 'utility';
export const data = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Manage bot settings on this server.')
    .addSubcommand(subcommand => subcommand
        .setName('alter')
        .setDescription('Alter a certain setting.')
        .addStringOption(option => option
            .setName('setting')
            .setDescription('The name of the setting to be altered.')
            .addChoices(choices)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('value')
            .setDescription('Set a value for the setting.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('clear')
        .setDescription('Clear a certain setting.')
        .addStringOption(option => option
            .setName('setting')
            .setDescription('The name of the setting to be cleared.')
            .addChoices(choices)
            .setRequired(true)
        )
    );
export async function execute(interaction) {
    await interaction.deferReply();

    const session = interaction.client.session;

    if (interaction.options.getSubcommand() === 'alter') {
        const setting = interaction.options.getString('setting', true);
        const settingValue = interaction.options.getString('value', true);

        await session.sql(`insert into ${setting} values (${interaction.guild.id}, ${settingValue}) on duplicate key update settingValue = ${settingValue};`).execute();

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
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

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Setting cleared.')
                    .setDescription(`Setting \`${setting}\` has been successfully cleared.`)
                    .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                    .setTimestamp()
                    .setFooter({ text: 'Spy Configuration' })
            ]
        });
    }
}