import { EmbedBuilder, SlashCommandBuilder, Colors } from 'discord.js';
import axios from 'axios';
import { logos } from '../misc/logos.js';

export const data = new SlashCommandBuilder()
    .setName('events')
    .setDescription('[EO+] Manage the community events.')
    .addSubcommand(subcommand => subcommand
        .setName('schedule')
        .setDescription('[EO+] Schedule the community event.')
        .addStringOption(option => option
            .setName('game_url')
            .setDescription('URL to the event game.')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('time')
            .setDescription('The UNIX timestamp of event time (seconds).')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('duration')
            .setDescription('Event duration (text).')
        )
        .addStringOption(option => option
            .setName('comment')
            .setDescription('Optional comment about the upcoming event.')
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('start')
        .setDescription('[EO+] Start the scheduled event.')
        .addStringOption(option => option
            .setName('event_id')
            .setDescription('ID of the event to be started.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('join')
            .setDescription('A way to join your event.')
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('conclude')
        .setDescription('[EO+] Conclude the scheduled event.')
        .addStringOption(option => option
            .setName('event_id')
            .setDescription('ID of the event to be concluded.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('comment')
            .setDescription('Optional comment about this event.')
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('cancel')
        .setDescription('[EO+] Cancel the scheduled event.')
        .addStringOption(option => option
            .setName('event_id')
            .setDescription('ID of the event to be cancelled.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the event cancellation.')
            .setRequired(true)
        )
    )
    .addSubcommandGroup(subcommandGroup => subcommandGroup
        .setName('update')
        .setDescription('[EO+] Update the event configuration.')
        .addSubcommand(subcommand => subcommand
            .setName('time')
            .setDescription('Reschedule the event.')
            .addStringOption(option => option
                .setName('event_id')
                .setDescription('ID of the event to be rescheduled.')
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('new_time')
                .setDescription('The new event time.')
                .setRequired(true)
            )
        )
    );
export async function execute(interaction) {
    await interaction.deferReply();

    const knex = interaction.client.knex;
    const setting = await knex('eventUsersRolesSetting')
        .select('*')
        .where('guildId', interaction.guild.id);
    const allowedIds = setting.map(setting => setting.settingValue);

    if (!(allowedIds.includes(interaction.user.id) || interaction.member.roles.cache.hasAny(...allowedIds) || interaction.memberPermissions.has('Administrator'))) {
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
    };

    const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle('Error.')
        .setThumbnail(logos.warning)
        .setTimestamp()
        .setFooter({ text: 'Spy' });
    const channelSetting = await knex('eventAnnsChannelSetting')
        .select('*')
        .where('guildId', interaction.guild.id)
        .first();
    const roleSetting = await knex('eventPingRoleSetting')
        .select('*')
        .where('guildId', interaction.guild.id)
        .first();

    if (!channelSetting) {
        errorEmbed.setDescription(`Event announcements channel setting not configured.`);

        return await interaction.followUp({ embeds: [errorEmbed] });
    };

    if (!roleSetting) {
        errorEmbed.setDescription(`Event ping role not configured.`)

        return await interaction.followUp({ embeds: [errorEmbed] });
    };

    const role = roleSetting.settingValue;
    const channel = await interaction.client.channels.cache.get(channelSetting.settingValue);
    const subcommand = interaction.options.getSubcommand();
    const subcommandsToCheck = ['start', 'conclude', 'cancel', 'time'];

    async function eventCheck(eventId, status = 0) {
        if (subcommandsToCheck.includes(subcommand)) {
            const event = await knex('communityEvents')
                .select('*')
                .where('eventId', eventId)
                .andWhere('guildId', interaction.guild.id)
                .first();

            if (!event) {
                errorEmbed.setDescription(`Event with ID \`${eventId}\` has not been found in the database.`);

                return await interaction.followUp({ embeds: [errorEmbed] });
            };

            if (event.eventStatus === status) {
                switch (status) {
                    case 1:
                        errorEmbed.setDescription('This event has not been started yet.')

                        break;
                    case 2:
                        errorEmbed.setDescription('This event has already been concluded.')

                        break;
                };

                return await interaction.followUp({ embeds: [errorEmbed] });
            };

            return event;
        };
    };

    if (interaction.options.getSubcommand() === 'schedule') {
        const gameUrl = interaction.options.getString('game_url', true);
        const time = interaction.options.getInteger('time', true);
        const duration = interaction.options.getString('duration') ?? 'Not specified.';
        const comment = interaction.options.getString('comment') ?? '';
        const existingEvent = await knex('communityEvents')
            .select('*')
            .where('eventTime', time)
            .andWhere('guildId', interaction.guild.id)
            .first();

        if (existingEvent) {
            errorEmbed.setDescription(`There's already an event scheduled for this time.`);

            return await interaction.followUp({ embeds: [errorEmbed] });
        };

        if (time <= Math.round(Date.now() / 1000)) {
            errorEmbed.setDescription(`Cannot schedule an event in the past.`);

            return await interaction.followUp({ embeds: [errorEmbed] });
        };

        const eventId = crypto.randomUUID();
        const placeid = gameUrl.split('/')[4];
        const gameResponse = await axios.get(`https://www.roblox.com/places/api-get-details?assetId=${placeid}`);
        const gameName = gameResponse.data.Name;
        let eventDesc;

        if (comment === '') {
            eventDesc = `**Event duration**: ${duration}\n\n**This event is going to take place in** [${gameName}](${gameUrl}).\n\n**React with :white_check_mark: if you're planning to attend this event.**`;
        } else {
            eventDesc = `**Event duration**: ${duration}\n\n**This event is going to take place in** [${gameName}](${gameUrl}).\n\n**Note from host:** ${comment}\n\n**React with :white_check_mark: if you're planning to attend this event.**`;
        }

        const thumbnailResponse = await axios.get(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeid}&returnPolicy=PlaceHolder&size=150x150&format=Webp&isCircular=false`);
        const gameThumbnail = thumbnailResponse.data.data[0].imageUrl;

        await knex.raw(
            `insert into communityEvents(guildId, eventId, eventHost, eventGameUrl, eventGameName, gameThumbnailUrl, eventTime, reminded) values (?, ?, ?, ?, ?, ?, ?, 0)`,
            [interaction.guild.id, eventId, interaction.user.id, gameUrl, gameName, gameThumbnail, time]
        );

        const sentAnns = await channel.send({
            content: `<@&${role}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`Event in ${gameName} has been scheduled on <t:${time}:f>!`)
                    .setDescription(eventDesc)
                    .setFields(
                        { name: 'Event Host', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Event ID', value: `${eventId}`, inline: true }
                    )
                    .setThumbnail(gameThumbnail)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });

        await sentAnns.react('✅');
        await channel.send(gameUrl);
        await knex('communityEvents')
            .update({ annsMessageId: sentAnns.id })
            .where('eventId', eventId);
        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('The community event has been scheduled successfully.')
                    .setFields(
                        { name: 'Event Time', value: `<t:${time}:f>` },
                        { name: 'Event ID', value: `${eventId}` }
                    )
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    } else if (interaction.options.getSubcommand() === 'start') {
        const eventId = interaction.options.getString('event_id', true);
        const join = interaction.options.getString('join');
        const event = await eventCheck(eventId, 2);

        await knex('communityEvents')
            .update({ eventStatus: 2 })
            .where('eventId', eventId);

        const gameName = event.eventGameName;
        const gameThumbnail = event.gameThumbnailUrl;
        let desc;

        if (!join) {
            desc = `The scheduled event in ${gameName} is starting now.`;
        } else {
            desc = `The scheduled event in ${gameName} is starting now.\n\n**Join the event:** ${join}`;
        };

        const annsMessage = await channel.messages.cache.get(event.annsMessageId);
        if (!annsMessage) return;

        await annsMessage.reply({
            content: `<@&${role}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`The scheduled event is starting now!`)
                    .setDescription(desc)
                    .setFields({ name: 'Event ID', value: `${eventId}` })
                    .setThumbnail(gameThumbnail)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('The scheduled event has been started successfully. Enjoy!')
                    .setFields({ name: 'Event ID', value: `${eventId}` })
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    } else if (interaction.options.getSubcommand() === 'conclude') {
        const eventId = interaction.options.getString('event_id', true);
        const comment = interaction.options.getString('comment');
        const event = await eventCheck(eventId, 1);
        
        await knex('communityEvents')
            .del()
            .where('eventId', eventId);

        const gameName = event.eventGameName;
        const gameThumbnail = event.gameThumbnailUrl;
        let desc;

        if (!comment) {
            desc = `The scheduled event in ${gameName} has been concluded. Thank you for attending!`;
        } else {
            desc = `The scheduled event in ${gameName} has been concluded. Thank you for attending!\n\n**Comment from host:** ${comment}`;
        };

        const annsMessage = await channel.messages.cache.get(event.annsMessageId);
        if (!annsMessage) return;

        await annsMessage.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`The scheduled event has been concluded.`)
                    .setDescription(desc)
                    .setThumbnail(gameThumbnail)
                    .setTimestamp()
                    .setFooter({ text: `Spy` })
            ]
        });

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('The scheduled event has been concluded successfully.')
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    } else if (interaction.options.getSubcommand() === 'cancel') {
        const eventId = interaction.options.getString('event_id', true);
        const reason = interaction.options.getString('reason', true);
        const event = await eventCheck(eventId);
        
        await knex('communityEvents')
            .del()
            .where('eventId', eventId);

        const gameName = event.eventGameName;
        const gameThumbnail = event.gameThumbnailUrl;
        const annsMessage = await channel.messages.cache.get(event.annsMessageId);
        if (!annsMessage) return;

        await annsMessage.reply({
            content: `<@&${role}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`The scheduled event has been cancelled.`)
                    .setDescription(`The scheduled event in ${gameName} has been cancelled.\n\nSorry for the inconvenience!`)
                    .setFields({ name: 'Reason', value: `${reason}` })
                    .setThumbnail(gameThumbnail)
                    .setTimestamp()
                    .setFooter({ text: `Spy` })
            ]
        });

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('The scheduled event has been cancelled and deleted successfully.')
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    } else if (interaction.options.getSubcommandGroup() === 'update') {
        const eventId = interaction.options.getString('event_id', true);
        const event = await eventCheck(eventId, 2);

        if (interaction.options.getSubcommand() === 'time') {
            const time = interaction.options.getInteger('new_time', true);

            if (event.eventTime === time) {
                errorEmbed.setDescription(`New time cannot be the same as the old time.`);

                return await interaction.followUp({ embeds: [errorEmbed] });
            };

            await knex('communityEvents')
                .update({ eventTime: time })
                .where('eventId', eventId);

            const gameName = event.eventGameName;
            const gameThumbnail = event.gameThumbnailUrl;
            const annsMessage = await channel.messages.cache.get(event.annsMessageId);
            if (!annsMessage) return;

            await annsMessage.reply({
                content: `<@&${role}>`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x2B2D31)
                        .setTitle(`The scheduled event has been rescheduled.`)
                        .setDescription(`The scheduled event in ${gameName} has been rescheduled.\n\n**Please adjust your availability accordingly.**`)
                        .setFields(
                            { name: 'New Time', value: `<t:${time}:f>`, inline: true },
                            { name: 'Event ID', value: `${eventId}`, inline: true }
                        )
                        .setThumbnail(gameThumbnail)
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });

            await annsMessage.edit({
                content: annsMessage.content,
                embeds: [
                    new EmbedBuilder()
                        .setColor(annsMessage.embeds[0].hexColor)
                        .setTitle(`Event in ${gameName} has been scheduled on <t:${time}:f>!`)
                        .setFields(annsMessage.embeds[0].fields)
                        .setDescription(annsMessage.embeds[0].description)
                        .setThumbnail(annsMessage.embeds[0].thumbnail.url)
                        .setTimestamp()
                        .setFooter(annsMessage.embeds[0].footer)
                ]
            });

            return await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle('Success.')
                        .setDescription('The scheduled event has been rescheduled successfully.')
                        .setFields(
                            { name: 'New Time', value: `<t:${time}:f>` },
                            { name: 'Event ID', value: `${eventId}` }
                        )
                        .setThumbnail(logos.checkmark)
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });
        };
    };
};