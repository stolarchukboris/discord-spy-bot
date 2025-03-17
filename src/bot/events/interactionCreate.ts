import { AutocompleteInteraction, ChatInputCommandInteraction, Guild, GuildMemberRoleManager, PermissionsBitField, TextChannel } from "discord.js";
import { botCommand } from "../../types/global.js";
import { spyBot } from "../../index.js";
import { sendError } from "../../misc/function.js";

export default async (spyBot: spyBot, interaction: ChatInputCommandInteraction<'cached'> | AutocompleteInteraction<'cached'>) => {
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

        if (!command) return await sendError(interaction, { errorMessage: `No command with name \`${sentCommand}\` has been found.` });

        const subCommand = options.getSubcommand(false);

        if (subCommand) command = command.subcommands?.find(subCom => subCom.name == subCommand);

        if (!command) return await sendError(interaction, { errorMessage: `No subcommand with name \`${sentCommand}\` has been found.` });

        const perms = interaction.member.permissions as Readonly<PermissionsBitField>;

        if ((command.developer && !(interaction.user.id === spyBot.env.OWNER_ID))
            || (command.admin && !perms.has('Administrator'))) return await sendError(interaction, { errorMessage: 'You are not authorized to run this command.' });

        const args = [];
        if (command.eo) {
            const permittedUsersSetting = await spyBot.knex<settingInfo>('eventUsersRolesSetting')
                .select('*')
                .where('guildId', interaction.guild.id);
            const allowedIds = permittedUsersSetting.map(setting => setting.settingValue) as string[];
            const roles = interaction.member.roles as GuildMemberRoleManager;

            if (!(allowedIds.includes(interaction.user.id) || roles.cache.hasAny(...allowedIds) || perms.has('Administrator')))
                return await sendError(interaction, { errorMessage: 'You are not authorized to run this command.' });

            const channelSetting = await spyBot.knex<settingInfo>('eventAnnsChannelSetting')
                .select('*')
                .where('guildId', interaction.guild.id)
                .first();
            const roleSetting = await spyBot.knex<settingInfo>('eventPingRoleSetting')
                .select('*')
                .where('guildId', interaction.guild.id)
                .first();

            if (!channelSetting || !roleSetting) return await sendError(interaction, { errorMessage: !channelSetting ? 'Event announcements channel not configured.' : 'Events ping role not configured.' });

            const channel = spyBot.bot.channels.cache.get(channelSetting.settingValue as string) as TextChannel;
            if (!channel.isTextBased()) return await sendError(interaction, { errorMessage: 'The provided event announcements channel is not a text channel.' });

            if (command.name !== 'schedule') {
                const eventId = interaction.options.getString('event_id', true);
                const event = await spyBot.knex<eventInfo>('communityEvents')
                    .select('*')
                    .where('eventId', eventId)
                    .andWhere('guildId', (interaction.guild as Guild).id)
                    .first();

                if (!event) return await sendError(interaction, { errorMessage: `Even with ID \`${eventId}\` has not been found in the database.` });

                let status;

                if (command.name === 'conclude') status = 1;
                if (command.name === 'start' || command.name === 'update') status = 2;
                if (event.eventStatus === status) return await sendError(interaction, { errorMessage: status === 1 ? 'This event has not been started yet.' : 'This event has already been started.' });

                args.push(event);
            }

            args.push(channel, roleSetting.settingValue);
        }

        if (command.vc && !interaction.member.voice.channel) return await sendError(interaction, { errorMessage: 'You must be in a Voice Channel to run this command.' });

        try {
            await command.execute(interaction, ...args);
        } catch (error) {
            console.error(error);

            return await sendError(interaction);
        }
    } else if (interaction.isAutocomplete()) {
        const sentCommand = interaction.commandName;
        const options = interaction.options;
        let command: botCommand | undefined;

        spyBot.bot.commands.list.find(category => {
            command = category.find(com => com.name == sentCommand);
            return command;
        });

        if (!command) return;

        const subCommand = options.getSubcommand(false);
        if (subCommand) {
            command = command.subcommands?.find(subCom => subCom.name == subCommand);
        }

        if (!command || !command.autocomplete) return;

        await command.autocomplete(interaction);
    }
}