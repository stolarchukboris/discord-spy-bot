import { ChatInputCommandInteraction, GuildMemberRoleManager, PermissionsBitField, TextChannel } from "discord.js";
import { botCommand } from "../../types/global.js";
import { spyBot } from "../../index.js";
import { errorEmbed } from "../../misc/function.js";

export default async (spyBot: spyBot, interaction: ChatInputCommandInteraction) => {
    if (!interaction.member) return;
    if (!interaction.guild) return;

    if (interaction.isChatInputCommand()) {
        await interaction.deferReply();

        const sentCommand: string = interaction.commandName;
        const options = interaction.options;
        let command: botCommand | undefined;

        spyBot.bot.commands.list.find(category => {
            command = category.find(comm => comm.name == sentCommand);
            return command;
        });

        if (!command) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No command with name \`${sentCommand}\` has been found.`)] });

        const subCommand = options.getSubcommand(false);

        if (subCommand) command = command.subcommands?.find(subCom => subCom.name == subCommand);

        if (!command) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No subcommand with name \`${sentCommand}\` has been found.`)] });

        const perms = interaction.member.permissions as Readonly<PermissionsBitField>;

        if ((command.developer && !(interaction.user.id === spyBot.env.OWNER_ID))
            || (command.admin && !perms.has('Administrator'))) return await interaction.editReply({
                embeds: [errorEmbed.setDescription('You are not authorized to run this command.')]
            });

        const args = [];
        if (command.eo) {
            const permittedUsersSetting = await spyBot.knex<settingInfo>('eventUsersRolesSetting')
                .select('*')
                .where('guildId', interaction.guild.id);
            const allowedIds = permittedUsersSetting.map(setting => setting.settingValue) as string[];
            const roles = interaction.member.roles as GuildMemberRoleManager;

            if (!(allowedIds.includes(interaction.user.id) || roles.cache.hasAny(...allowedIds) || perms.has('Administrator'))) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('You are not authorized to run this command.')] });
            }

            const channelSetting = await spyBot.knex<settingInfo>('eventAnnsChannelSetting')
                .select('*')
                .where('guildId', interaction.guild.id)
                .first();
            const roleSetting = await spyBot.knex<settingInfo>('eventPingRoleSetting')
                .select('*')
                .where('guildId', interaction.guild.id)
                .first();

            if (!channelSetting || !roleSetting) return await interaction.editReply({ embeds: [errorEmbed.setDescription(!channelSetting ? 'Event announcements channel not configured.' : 'Events ping role not configured.')] });

            const channel = spyBot.bot.channels.cache.get(channelSetting.settingValue as string) as TextChannel;
            if (!channel.isTextBased()) return await interaction.editReply({ embeds: [errorEmbed.setDescription('The provided event announcements channel is not a text channel.')] });

            args.push(channel, roleSetting.settingValue);
        }

        try {
            await command.execute(interaction, ...args);
        } catch (error) {
            console.error(error);

            return await interaction.editReply({ embeds: [errorEmbed.setDescription('An error has occured. Please check the bot console for more information.')] });
        }
    }
}