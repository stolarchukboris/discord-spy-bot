import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { logos } from '../misc/logos.js';
import { settingsEnum } from '../misc/settingsEnum.js';

export const data = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('[ADMIN+] Manage bot settings on this server.')
    .addSubcommand(subcommand => subcommand
        .setName('alter')
        .setDescription('[ADMIN+] Alter a certain setting.')
        .addStringOption(option => option
            .setName('setting')
            .setDescription('The name of the setting to be altered.')
            .addChoices(settingsEnum)
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
        .setDescription('[ADMIN+] Clear a certain setting.')
        .addStringOption(option => option
            .setName('setting')
            .setDescription('The name of the setting to be cleared.')
            .addChoices(settingsEnum)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('value')
            .setDescription('The value of the setting to be cleared. Ignore to clear all setting values.')
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('view')
        .setDescription('[ADMIN+] View the current bot configuration on this server.')
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
    } else if (interaction.options.getSubcommand() === 'view') {
        const setup = [];
        const notSetup = [];
        for (const setting of settingsEnum) {
            const result = await knex(setting.value)
                .select('*')
                .where('guildId', interaction.guild.id);

            if (!result || result.length === 0) {
                notSetup.push(setting.name);
            } else {
                setup.push(setting.name);
            };
        };

        let setupField = ``;
        let notSetupField = ``;
        let color;
        let desc;

        color = Colors.Yellow;

        if (setup.length === 0) {
            setupField = 'None.';
            desc = 'Bot has not been set up yet. Only basic functionality is available.';
        } else {
            for (const setting of setup) {
                setupField = setupField.concat(`- ${setting}\n`);
            };
        };

        if (notSetup.length === 0) {
            notSetupField = 'None.';
            color = Colors.Green;
            desc = 'Bot is all set.';
        } else {
            for (const setting of notSetup) {
                notSetupField = notSetupField.concat(`- ${setting}\n`);
            };
        };

        if (setup.length > 0 && notSetup.length > 0) {
            desc = 'Some bot modules have not been set up yet.';
        };

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(color)
                    .setTitle('Configuration Info')
                    .setDescription(desc)
                    .setFields(
                        { name: 'Set up', value: setupField, inline: true },
                        { name: 'Not set up', value: notSetupField, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Spy Configuration' })
            ]
        });
    };
};