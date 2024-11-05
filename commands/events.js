const { EmbedBuilder, SlashCommandBuilder, GuildScheduledEventManager } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('events')
        .setDescription('Manage the community events.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedule')
                .setDescription('Schedule the community event. It will automatically start at the designated time.')
                .addStringOption(option =>
                    option
                        .setName('game_url')
                        .setDescription('URL to the event game.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('time')
                        .setDescription('The UNIX timestamp of event time (seconds).')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('duration')
                        .setDescription('Event duration (text).')
                )
                .addStringOption(option =>
                    option
                        .setName('comment')
                        .setDescription('Optional comment about the upcoming event.')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('conclude')
                .setDescription('Conclude the scheduled event.')
                .addStringOption(option =>
                    option
                        .setName('event_id')
                        .setDescription('ID of the event to be concluded.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('comment')
                        .setDescription('Optional comment about this event.')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('cancel')
                .setDescription('Cancel the scheduled event.')
                .addStringOption(option =>
                    option
                        .setName('event_id')
                        .setDescription('ID of the event to be cancelled.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Why is this event going to be cancelled?')
                        .setRequired(true)
                )
        )
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('update')
                .setDescription('Update the event configuration.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('time')
                        .setDescription('Reschedule the event.')
                        .addStringOption(option =>
                            option
                                .setName('event_id')
                                .setDescription('ID of the event to be rescheduled.')
                                .setRequired(true)
                        )
                        .addIntegerOption(option =>
                            option
                                .setName('new_time')
                                .setDescription('Set the new event time. Cannot be smaller than the current event time.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('game')
                        .setDescription('Update the event game (a.k.a location).')
                        .addStringOption(option =>
                            option
                                .setName('event_id')
                                .setDescription('ID of the event you want to modify.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option
                                .setName('new_game_url')
                                .setDescription('URL to new game.')
                                .setRequired(true)
                        )
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let errorMbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error while scheduling the event.')
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
            .setTimestamp()
            .setFooter({ text: 'Spy' })

        const guildEventManager = new GuildScheduledEventManager(interaction.client.guilds.cache.get('1268223382940422187'));

        if (interaction.options.getSubcommand() === 'schedule') {
            // check if parameters are valid first

            const url = interaction.options.getString('game_url', true);
            const placeid = url.split('/')[4];

            axios.get(`https://games.roblox.com/v1/games/${placeid}/servers/0`)
                .then(async function (response) {
                    if (response.status !== 200) {
                        errorMbed.setDescription(`Specified game doesn't exist.`);

                        await interaction.followUp({ embeds: [errorMbed] });
                    }

                    const time = interaction.options.getInteger('time', true);

                    if (typeof time !== 'number' || isNaN(time)) {
                        errorMbed.setDescription(`"Time" parameter must be a number.`);

                        await interaction.followUp({ embeds: [errorMbed] });
                    } else {
                        // if everything is alright

                        axios.get(`https://www.roblox.com/places/api-get-details?assetId=${placeid}`)
                            .then(async function (response1) {
                                const gameName = response1.data.Name;
                                const urlToGame = response1.data.Url;

                                axios.get(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeid}&returnPolicy=PlaceHolder&size=150x150&format=Webp&isCircular=false`)
                                    .then(async function (response2) {
                                        const gameThumbnail = response2.data.data[0].imageUrl;
                                        const eventTime = interaction.options.getInteger('time', true);

                                        let duration = interaction.options.getString('duration');
                                        if (duration === null || !(/s/ && /[a-zA-Z]/)) {duration = 'To be decided'}

                                        let eventDesc;
                                        const comment = interaction.options.getString('comment');

                                        if (comment === null) {eventDesc = `**Event host:** <@${interaction.user.id}>\n\n**Event duration**: ${duration}.\n\n**This event is going to take place in** [${gameName}](${urlToGame}).\n\n**React with :white_check_mark: if you're planning to attend this event.**`}
                                        else {eventDesc = `**Event host:** <@${interaction.user.id}>\n\n**Event duration**: ${duration}.\n\n**This event is going to take place in** [${gameName}](${urlToGame}).\n\n**Note from host:** ${comment}\n\n**React with :white_check_mark: if you're planning to attend this event.**`}

                                        await guildEventManager.create({
                                            name: `Event in ${gameName}`,
                                            description: `${urlToGame}`,
                                            image: gameThumbnail,
                                            entityType: 3,
                                            entityMetadata: {location: gameName},
                                            scheduledStartTime: eventTime*1000,
                                            scheduledEndTime: (eventTime+36000)*1000,
                                            channel: '1268223384307634264',
                                            privacyLevel: 2,
                                        });

                                        const lastKey = (await guildEventManager.fetch()).lastKey();

                                        const mbed = new EmbedBuilder()
                                            .setColor(0x00FF00)
                                            .setTitle('Event scheduling successful!')
                                            .setDescription(`Successfully scheduled the event on <t:${eventTime}:F>.`)
                                            .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                                            .setTimestamp()
                                            .setFooter({ text: `Spy · Event ID: ${lastKey}`});
                                        
                                        const mbed2 = new EmbedBuilder()
                                            .setColor(0x2B2D31)
                                            .setTitle(`A new event has been scheduled on <t:${eventTime}:F>!`)
                                            .setDescription(eventDesc)
                                            .setThumbnail(gameThumbnail)
                                            .setTimestamp()
                                            .setFooter({ text: `Spy · Event ID: ${lastKey}`});

                                        interaction.followUp({ embeds: [mbed] });

                                        const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');

                                        channel.send({ content: `<@&1289909425368338505>`, embeds: [mbed2] })
                                            .then(sentMessage => sentMessage.react('✅'));
                                        channel.send(urlToGame);
                                    })

                                    .catch(async function (error) {
                                        errorMbed.setDescription(`${error}`);

                                        await interaction.followUp({ embeds: [errorMbed] });
                                        console.log(error);
                                    })


                            })

                            .catch(async function (error) {
                                errorMbed.setDescription(`${error}`);

                                await interaction.followUp({ embeds: [errorMbed] });
                                console.log(error);
                            })
                    }
                })

                .catch(async function (error) {
                    errorMbed.setDescription(`${error}`);

                    await interaction.followUp({ embeds: [errorMbed] });
                    console.log(error);
                });
        }

        else if (interaction.options.getSubcommand() === 'conclude') {
            errorMbed.setTitle('Error while concluding the scheduled event.');

            const eventId = interaction.options.getString('event_id', true);
            const comment = interaction.options.getString('comment');

            try {
                const event = await guildEventManager.fetch(eventId);

                if (event.status === 2) {
                    const mbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('Event concluded successfully!')
                        .setDescription(`Successfully concluded the event with ID ${eventId}!`)
                        .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                        .setTimestamp()
                        .setFooter({ text: `Spy`});

                    const mbed2 = new EmbedBuilder()
                        .setColor(0x2B2D31)
                        .setTitle(`The ${event.name} has been concluded!`)
                        .setThumbnail(event.coverImageURL())
                        .setTimestamp()
                        .setFooter({ text: `Spy`});

                    if (comment === null) {mbed2.setDescription(`The scheduled ${event.name} has been concluded. Thank you for attending!\n\n** **`)}
                    else {mbed2.setDescription(`The scheduled ${event.name} has been concluded. Thank you for attending!\n\n**Comment about the event:** ${comment}\n\n** **`)}

                    interaction.followUp({ embeds: [mbed] });

                    const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');

                    channel.send({ embeds: [mbed2] });

                    await event.setStatus(3);
                } else {
                    errorMbed.setDescription(`The specified event hasn't been started yet.`);

                    interaction.followUp({ embeds: [errorMbed] });
                }

            } catch (error) {
                errorMbed.setDescription(`${error}`);

                await interaction.followUp({ embeds: [errorMbed] });
                console.log(error);
            }
        }

        else if (interaction.options.getSubcommand() === 'cancel') {
            errorMbed.setTitle('Error while cancelling the scheduled event.');

            const eventId = interaction.options.getString('event_id', true);
            const reason = interaction.options.getString('reason', true);

            try {
                const event = await guildEventManager.fetch(eventId);

                if (event.status === 1) {
                    const mbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('Event cancelled successfully!')
                        .setDescription(`Successfully cancelled the event with ID ${eventId}!`)
                        .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                        .setTimestamp()
                        .setFooter({ text: `Spy` });

                    const mbed2 = new EmbedBuilder()
                        .setColor(0x2B2D31)
                        .setTitle(`The ${event.name} has been cancelled!`)
                        .setDescription(`The scheduled ${event.name} has been cancelled.\n## Reason:\n${reason}\n\n** **`)
                        .setThumbnail(event.coverImageURL())
                        .setTimestamp()
                        .setFooter({ text: `Spy` });

                    interaction.followUp({ embeds: [mbed] });

                    const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');
                    channel.send({ content: `<@&1289909425368338505>`, embeds: [mbed2] });

                    await event.setStatus(4);
                } else {
                    errorMbed.setDescription(`Cannot cancel the already cancelled/completed or ongoing event.`);

                    interaction.followUp({ embeds: [errorMbed] });
                }

            } catch (error) {
                errorMbed.setDescription(`${error}`)

                await interaction.followUp({ embeds: [errorMbed] });
                console.log(error);
            }
        }

        else if (interaction.options.getSubcommandGroup() === 'update') {
            if (interaction.options.getSubcommand() === 'time') {
                const eventId = interaction.options.getString('event_id', true);
                const newTime = interaction.options.getInteger('new_time', true);

                try {
                    let event = await guildEventManager.fetch(eventId);

                    if ((event.status === 1) && (Math.round(event.scheduledStartTimestamp / 1000) !== newTime)) {
                        event = await event.edit({
                            scheduledStartTime: newTime*1000,
                            scheduledEndTime: (newTime+36000)*1000,
                        });

                        const mbed = new EmbedBuilder()
                            .setColor(0x00FF00)
                            .setTitle('Event rescheduled successfully!')
                            .setDescription(`Successfully rescheduled the event with ID ${eventId}!\nNew time: <t:${Math.round(event.scheduledStartTimestamp / 1000)}:f>`)
                            .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                            .setTimestamp()
                            .setFooter({ text: `Spy · Event ID: ${event.id}` });

                        const mbed2 = new EmbedBuilder()
                            .setColor(0x2B2D31)
                            .setTitle(`The ${event.name} has been rescheduled!`)
                            .setDescription(`The ${event.name} has been rescheduled.\n## New time:\n<t:${Math.round(event.scheduledStartTimestamp / 1000)}:f>\n\n**React with ✅ if you're still planning to attend.**`)
                            .setThumbnail(event.coverImageURL())
                            .setTimestamp()
                            .setFooter({ text: `Spy · Event ID: ${event.id}` });

                        interaction.followUp({ embeds: [mbed] });

                        const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');
                        channel.send({ content: `<@&1289909425368338505>`, embeds: [mbed2] })
                            .then(sentMessage => sentMessage.react('✅'));

                    } else {
                        errorMbed
                            .setTitle('Error while updating the event.')
                            .setDescription(`This could mean:\n- You're trying to update an unscheduled event.\n- Old event time is equal to new event time.`);

                        interaction.followUp({ embeds: [errorMbed] });
                    }

                } catch (error) {
                    errorMbed.setDescription(`${error}`)

                    await interaction.followUp({ embeds: [errorMbed] });
                    console.log(error);
                }
            }

            else if (interaction.options.getSubcommand() === 'game') {
                const eventId = interaction.options.getString('event_id', true);
                const newUrl = interaction.options.getString('new_game_url', true);

                try {
                    const placeid = newUrl.split('/')[4];
                    let oldEvent = await guildEventManager.fetch(eventId);

                    if ((oldEvent.status === 1) && (oldEvent.description !== newUrl)) {
                        axios.get(`https://www.roblox.com/places/api-get-details?assetId=${placeid}`)
                            .then(async function (response1) {
                                const gameName = response1.data.Name;
                                const urlToGame = response1.data.Url;

                                axios.get(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeid}&returnPolicy=PlaceHolder&size=150x150&format=Webp&isCircular=false`)
                                    .then(async function (response2) {
                                        const gameThumbnail = response2.data.data[0].imageUrl;

                                        const event = await oldEvent.edit({
                                            name: `Event in ${gameName}`,
                                            entityMetadata: { location: gameName },
                                            image: gameThumbnail,
                                            description: urlToGame
                                        });

                                        const mbed = new EmbedBuilder()
                                            .setColor(0x00FF00)
                                            .setTitle('Event game changed successfully!')
                                            .setDescription(`Successfully changed the event game for event with ID ${eventId}!\nNew game: ${gameName}.`)
                                            .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                                            .setTimestamp()
                                            .setFooter({ text: `Spy · Event ID: ${eventId}` });

                                        const mbed2 = new EmbedBuilder()
                                            .setColor(0x2B2D31)
                                            .setTitle(`The ${oldEvent.name} has been cancelled and changed to ${event.name}!`)
                                            .setDescription(`The event will now take place in ${gameName}.\n\n## New game:\n${urlToGame}\n\n**React with ✅ if you're still planning to attend this event.**`)
                                            .setThumbnail(gameThumbnail)
                                            .setTimestamp()
                                            .setFooter({ text: `Spy · Event ID: ${eventId}` });

                                        interaction.followUp({ embeds: [mbed] });

                                        const channel = interaction.client.channels.cache.find(channel => channel.name === 'event-announcements');
                                        channel.send({ content: `<@&1289909425368338505>`, embeds: [mbed2] })
                                            .then(sentMessage => sentMessage.react('✅'));
                                    })

                                    .catch(async function (error) {
                                        errorMbed.setDescription(`${error}`);

                                        await interaction.followUp({ embeds: [errorMbed] });
                                        console.log(error);
                                    });
                            })

                            .catch(async function (error) {
                                errorMbed.setDescription(`${error}`);

                                await interaction.followUp({ embeds: [errorMbed] });
                                console.log(error);
                            });

                    } else {
                        errorMbed.setDescription(`Can only reconfigure the scheduled event.`);

                        interaction.followUp({ embeds: [errorMbed] });
                    }

                } catch (error) {
                    errorMbed.setDescription(`${error}`)

                    await interaction.followUp({ embeds: [errorMbed] });
                    console.log(error);
                }
            }
        }
    },
};