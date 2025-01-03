import { EmbedBuilder, SlashCommandBuilder, Colors } from 'discord.js';
import axios from 'axios';

export const data = new SlashCommandBuilder()
    .setName('events')
    .setDescription('Manage the community events.')
    .addSubcommand(subcommand => subcommand
        .setName('schedule')
        .setDescription('Schedule the community event.')
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
        .setDescription('Start the scheduled event.')
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
        .setDescription('Conclude the scheduled event.')
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
        .setDescription('Cancel the scheduled event.')
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
        .setDescription('Update the event configuration.')
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
    await interaction.deferReply({ ephemeral: true });

    const session = interaction.client.session;

    const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle('Error.')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
        .setTimestamp()
        .setFooter({ text: 'Spy' });

    if (interaction.options.getSubcommand() === 'schedule') {
        const gameUrl = interaction.options.getString('game_url', true);
        const time = interaction.options.getInteger('time', true);
        const duration = interaction.options.getString('duration') ?? 'Not specified.';
        const comment = interaction.options.getString('comment') ?? '';
        const result = await session.sql(`select eventId from communityEvents where eventTime = ${time};`).execute();
        const existingEventId = result.fetchOne();

        if (!existingEventId) {
            const eventId = crypto.randomUUID();
            const placeid = gameUrl.split('/')[4];
            const gameResponse = await axios.get(`https://www.roblox.com/places/api-get-details?assetId=${placeid}`);
            const gameName = gameResponse.data.Name;
            let eventDesc;

            if (comment === '') {
                eventDesc = `**Event duration**: ${duration}.\n\n**This event is going to take place in** [${gameName}](${gameUrl}).\n\n**React with :white_check_mark: if you're planning to attend this event.**`;
            } else {
                eventDesc = `**Event duration**: ${duration}.\n\n**This event is going to take place in** [${gameName}](${gameUrl}).\n\n**Note from host:** ${comment}\n\n**React with :white_check_mark: if you're planning to attend this event.**`;
            }

            const thumbnailResponse = await axios.get(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeid}&returnPolicy=PlaceHolder&size=150x150&format=Webp&isCircular=false`);
            const gameThumbnail = thumbnailResponse.data.data[0].imageUrl;

            await session.sql(`insert into communityEvents(eventId, eventGameUrl, eventGameName, gameThumbnailUrl, eventTime) values ('${eventId}', '${gameUrl}', '${gameName}', '${gameThumbnail}', ${time});`).execute();
            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle('Event scheduled successfully.')
                        .setDescription('The community event has been scheduled successfully.')
                        .setFields(
                            { name: 'Event ID', value: `${eventId}` },
                            { name: 'Event Time', value: `<t:${time}:f>` }
                        )
                        .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });

            const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');
            const sentAnns = await channel.send({
                content: `<@&1289909425368338505>`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(2829617)
                        .setTitle(`Event in ${gameName} has been scheduled on <t:${time}:f>!`)
                        .setDescription(eventDesc)
                        .setFields(
                            { name: 'Event ID', value: `${eventId}`, inline: true },
                            { name: 'Event Host', value: `<@${interaction.user.id}>`, inline: true }
                        )
                        .setThumbnail(gameThumbnail)
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });
            await sentAnns.react('✅');
            await channel.send(gameUrl);
            await session.sql(`update communityEvents set annsMessageId = ${sentAnns.id} where eventId = '${eventId}';`).execute();
            return await session.close();
        } else {
            errorEmbed.setDescription(`There's already an event scheduled for this time.`);

            await interaction.followUp({ embeds: [errorEmbed] });
            return await session.close();
        };
    } else if (interaction.options.getSubcommand() === 'start') {
        const eventId = interaction.options.getString('event_id', true);
        const join = interaction.options.getString('join') ?? '';
        const result = await session.sql(`select eventStatus from communityEvents where eventId = '${eventId}';`).execute();
        const status = result.fetchOne()[0];

        if (status === 2) {
            errorEmbed.setDescription(`The event is already started.`);

            await interaction.followUp({ embeds: [errorEmbed] });
            return await session.close();
        } else {
            await session.sql(`update communityEvents set eventStatus = 2 where eventId = '${eventId}';`).execute();

            const result = await session.sql(`select eventGameName, gameThumbnailUrl from communityEvents where eventId = '${eventId}';`).execute();
            const array = result.fetchOne();
            const gameName = array[0];
            const gameThumbnail = array[1];
            let desc;

            if (join === '') { desc = `The scheduled event in ${gameName} is starting now.`; }
            else { desc = `The scheduled event in ${gameName} is starting now.\n\n**Join the event:** ${join}`; };

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle('Event started successfully.')
                        .setDescription('The scheduled event has been started successfully. Enjoy!')
                        .setFields({ name: 'Event ID', value: `${eventId}` })
                        .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });

            const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');
            const annsMessaageResult = await session.sql(`select annsMessageId from communityEvents where eventId = '${eventId}';`).execute();
            const messageId = annsMessaageResult.fetchOne()[0];
            const annsMessage = channel.messages.cache.get(messageId);

            await annsMessage.reply({
                content: `<@&1289909425368338505>`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(2829617)
                        .setTitle(`The scheduled event is starting now!`)
                        .setDescription(desc)
                        .setFields({ name: 'Event ID', value: `${eventId}` })
                        .setThumbnail(gameThumbnail)
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });

            return await session.close();
        }
    } else if (interaction.options.getSubcommand() === 'conclude') {
        const eventId = interaction.options.getString('event_id', true);
        const comment = interaction.options.getString('comment') ?? '';
        const result = await session.sql(`select eventStatus from communityEvents where eventId = '${eventId}';`).execute();
        const status = result.fetchOne()[0];

        if (status === 1) {
            errorEmbed.setDescription(`The event is not started yet.`);

            await interaction.followUp({ embeds: [errorEmbed] });
            return await session.close();
        } else {
            await session.sql(`update communityEvents set eventStatus = 3 where eventId = '${eventId}';`).execute();

            const result = await session.sql(`select eventGameName, gameThumbnailUrl from communityEvents where eventId = '${eventId}';`).execute();
            const array = result.fetchOne();
            const gameName = array[0];
            const gameThumbnail = array[1];
            let desc;

            if (comment === '') { desc = `The scheduled event in ${gameName} has been concluded. Thank you for attending!`; }
            else { desc = `The scheduled event in ${gameName} has been concluded. Thank you for attending!\n\n**Comment from host:** ${comment}`; };

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle('Event concluded successfully.')
                        .setDescription('The scheduled event has been concluded successfully.')
                        .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });

            const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');
            const annsMessaageResult = await session.sql(`select annsMessageId from communityEvents where eventId = '${eventId}';`).execute();
            const messageId = annsMessaageResult.fetchOne()[0];
            const annsMessage = channel.messages.cache.get(messageId);

            await annsMessage.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(2829617)
                        .setTitle(`The scheduled event has been concluded.`)
                        .setDescription(desc)
                        .setThumbnail(gameThumbnail)
                        .setTimestamp()
                        .setFooter({ text: `Spy` })
                ]
            });

            await session.sql(`delete from communityEvents where eventId = '${eventId}';`).execute();
            return await session.close();
        }
    } else if (interaction.options.getSubcommand() === 'cancel') {
        const eventId = interaction.options.getString('event_id', true);
        const reason = interaction.options.getString('reason', true);

        await session.sql(`update communityEvents set eventStatus = 0 where eventId = '${eventId}';`).execute();

        const result = await session.sql(`select eventGameName, gameThumbnailUrl from communityEvents where eventId = '${eventId}';`).execute();
        const array = result.fetchOne();
        const gameName = array[0];
        const gameThumbnail = array[1];

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Event cancelled successfully.')
                    .setDescription('The scheduled event has been cancelled and deleted successfully.')
                    .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });

        const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');
        const annsMessaageResult = await session.sql(`select annsMessageId from communityEvents where eventId = '${eventId}';`).execute();
        const messageId = annsMessaageResult.fetchOne()[0];
        const prevAnnsMessage = channel.messages.cache.get(messageId);

        await prevAnnsMessage.reply({
            content: `<@&1289909425368338505>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(2829617)
                    .setTitle(`The scheduled event has been cancelled.`)
                    .setDescription(`The scheduled event in ${gameName} has been cancelled.\n\nSorry for the inconvenience!`)
                    .setFields({ name: 'Reason', value: `${reason}` })
                    .setThumbnail(gameThumbnail)
                    .setTimestamp()
                    .setFooter({ text: `Spy` })
            ]
        });

        await session.sql(`delete from communityEvents where eventId = '${eventId}';`).execute();
        return await session.close();
    } else if (interaction.options.getSubcommandGroup() === 'update') {
        const eventId = interaction.options.getString('event_id', true);
        const result = await session.sql(`select eventStatus from communityEvents where eventId = '${eventId}';`).execute();
        const status = result.fetchOne()[0];

        if (status !== 1) {
            errorEmbed.setDescription(`You can only update the scheduled event.`);

            await interaction.followUp({ embeds: [errorEmbed] });
            return await session.close();
        } else {
            if (interaction.options.getSubcommand() === 'time') {
                const time = interaction.options.getInteger('new_time', true);
                const result = await session.sql(`select eventTime from communityEvents where eventId = '${eventId}';`).execute();
                const oldTime = result.fetchOne()[0];

                if (oldTime === time) {
                    errorEmbed.setDescription(`New time cannot be the same as the old time.`);

                    await interaction.followUp({ embeds: [errorEmbed] });
                    return await session.close();
                } else {
                    await session.sql(`update communityEvents set eventTime = ${time} where eventId = '${eventId}';`).execute();

                    const result = await session.sql(`select eventGameName, gameThumbnailUrl from communityEvents where eventId = '${eventId}';`).execute();
                    const array = result.fetchOne();
                    const gameName = array[0];
                    const gameThumbnail = array[1];

                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Green)
                                .setTitle('Event rescheduled successfully.')
                                .setDescription('The scheduled event has been rescheduled successfully.')
                                .setFields(
                                    { name: 'New Time', value: `<t:${time}:f>` },
                                    { name: 'Event ID', value: `${eventId}` }
                                )
                                .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                                .setTimestamp()
                                .setFooter({ text: 'Spy' })
                        ]
                    });

                    const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');

                    const annsMessaageResult = await session.sql(`select annsMessageId from communityEvents where eventId = '${eventId}';`).execute();
                    const messageId = annsMessaageResult.fetchOne()[0];
                    const annsMessage = channel.messages.cache.get(messageId);
                    await annsMessage.reply({
                        content: `<@&1289909425368338505>`,
                        embeds: [
                            new EmbedBuilder()
                                .setColor(2829617)
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
                                .setDescription(annsMessage.embeds[0].description)
                                .setThumbnail(annsMessage.embeds[0].thumbnail.url)
                                .setTimestamp()
                                .setFooter(annsMessage.embeds[0].footer)
                        ]
                    });
                    return await session.close();
                }
            }
        }
    }
}