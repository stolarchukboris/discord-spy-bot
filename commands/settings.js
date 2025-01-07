import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { logos } from '../misc/logos.js';

const choices = [
    { name: 'Server logs channel ID', value: 'serverLogsChannelSetting' },
    { name: 'Starbord channel ID', value: 'starboardChannelSetting' },
    { name: 'Event announcements channel ID', value: 'eventAnnsChannelSetting' },
    { name: 'Starboard reactions minimum', value: 'starboardReactionsMin' },
    { name: 'Starboard react to own messages?', value: 'starboardReactToOwnMsgs' },
    { name: 'Moderator users/roles', value: 'modUsersRolesSetting' },
    { name: 'Event manager users/roles', value: 'eventUsersRolesSetting' }
];

export const data = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('[ADMIN] Manage bot settings on this server.')
    .addSubcommand(subcommand => subcommand
        .setName('alter')
        .setDescription('[ADMIN] Alter a certain setting.')
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
        .setDescription('[ADMIN] Clear a certain setting.')
        .addStringOption(option => option
            .setName('setting')
            .setDescription('The name of the setting to be cleared.')
            .addChoices(choices)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('value')
            .setDescription('The value of the setting to be cleared. Ignore to clear all setting values.')
        )
    );
export async function execute(interaction) {
    await interaction.deferReply();

    if (!(interaction.user.id === process.env.OWNER_ID || interaction.member.permissions.has('Administrator'))) {
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Error.')
                    .setDescription('You are not authorized to run this command.')
                    .setThumbnail(logos.warning)
                    .setTimestamp()
                    .setFooter({ text: 'Spy Configuration' })
            ]
        });
    };

    const knex = interaction.client.knex;

    if (interaction.options.getSubcommand() === 'alter') {
        const setting = interaction.options.getString('setting', true);
        const settingValue = interaction.options.getString('value', true);

        await knex.raw(
            `insert into ${setting} values (?, ?) on duplicate key update settingValue = ?`,
            [interaction.guild.id, settingValue, settingValue]
        );

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Setting \`${setting}\` has been successfully set to \`${settingValue}\`.`)
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy Configuration' })
            ]
        });
    } else if (interaction.options.getSubcommand() === 'clear') {
        const setting = interaction.options.getString('setting', true);
        const value = interaction.options.getString('value');
        let desc;

        if (!value) {
            await knex(setting)
                .del()
                .where('guildId', interaction.guild.id);

            desc = `Setting \`${setting}\` has been successfully cleared.`;
        } else {
            await knex(setting)
                .del()
                .where('guildId', interaction.guild.id)
                .andWhere('settingValue', value);

            desc = `Value \`${value}\` of a setting \`${setting}\` has been successfully cleared.`;
        };

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(desc)
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy Configuration' })
            ]
        });
    };
};