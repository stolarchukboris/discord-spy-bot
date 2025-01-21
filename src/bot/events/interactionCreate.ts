import { ChatInputCommandInteraction, Colors, EmbedBuilder, Guild, GuildMemberRoleManager, PermissionsBitField } from "discord.js";
import { botCommand } from "../../types/global";
import { spyBot } from "../../index.js";
import logos from '../../misc/logos.js';

export default async (spyBot: spyBot, interaction: ChatInputCommandInteraction) => {
    if (!interaction.member) return;
    if (!interaction.guild) return;

    if (interaction.isChatInputCommand()) {
        const sentCommand: string = interaction.commandName;
        const options = interaction.options;
        let command: botCommand | undefined;

        spyBot.bot.commands.list.find(category => {
            command = category.find(comm => comm.name == sentCommand);
            return command;
        });

        if (!command) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("Error.")
                        .setDescription(`No command was found matching name \`${sentCommand}\`.`)
                        .setThumbnail(logos.warning)
                        .setFooter({ text: 'Spy' })
                        .setTimestamp()
                ]
            });
        }

        const subCommand = options.getSubcommand(false);

        if (subCommand) {
            command = command.subcommands?.find(subCom => subCom.name == subCommand);
        }

        if (!command) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("Error.")
                        .setDescription(`No subcommand was found matching name \`${sentCommand}\`.`)
                        .setThumbnail(logos.warning)
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });
        }

        const perms = interaction.member.permissions as Readonly<PermissionsBitField>;

        if ((command.developer && !(interaction.user.id === spyBot.env.OWNER_ID))
            || (command.admin && !perms.has('Administrator'))) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("Error.")
                        .setDescription(`You are not authorized to run this command.`)
                        .setThumbnail(logos.warning)
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });
        }

        if (command.eo) {
            const setting = await spyBot.knex('eventUsersRolesSetting')
                .select('*')
                .where('guildId', interaction.guild.id);
            const allowedIds = setting.map(setting => setting.settingValue);
            const roles = interaction.member.roles as GuildMemberRoleManager;

            if (!(allowedIds.includes(interaction.user.id) || roles.cache.hasAny(...allowedIds) || perms.has('Administrator'))) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setTitle('Error.')
                            .setDescription('You are not authorized to run this command.')
                            .setThumbnail(logos.warning)
                            .setTimestamp()
                            .setFooter({ text: 'Spy' })
                    ]
                });
            }
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle("Error.")
                .setDescription(`An error has occured while executing this command. Check bot console for more info.`)
                .setThumbnail(logos.warning)
                .setTimestamp()
                .setFooter({ text: 'Spy' })

            if (interaction.replied || interaction.deferred) {
                return await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await interaction.reply({ embeds: [errorEmbed] });
            }
        }
    }
}