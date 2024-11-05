const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roblox')
        .setDescription('Interact with Roblox API.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('player')
                .setDescription('Get information on Roblox player.')
                .addStringOption(option =>
                    option
                        .setName('username')
                        .setDescription("Player's username.")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        if (interaction.options.getSubcommand() === 'player') {
            const uname = interaction.options.getString('username', true);

            axios.post('https://users.roblox.com/v1/usernames/users', {
            "usernames": [
                `${uname}`
            ],
            "excludeBannedUsers": true
            })
            .then(async function (response) {
                const userid = parseInt(response.data.data[0].id);

                axios.post('https://presence.roblox.com/v1/presence/users', {
                    "userIds": [
                        userid
                    ]
                })
                .then(async function (response2) {
                    axios.get(`https://users.roblox.com/v1/users/${userid}`)
                        .then(async function (response1) {
                            axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userid}&size=420x420&format=Png&isCircular=false`)
                                .then(async function (response) {
                                    let color;
                                    const pfpURL = response.data.data[0].imageUrl;
                                    let desc = response1.data.description;
                                    let presenceType = response2.data.userPresences[0].userPresenceType;
                                    const lastOnline = response2.data.userPresences[0].lastOnline;

                                    if (desc === "") { desc = "No description provided." }
                                    if (presenceType === 0) { presenceType = "Offline."; color = 0x999999 }
                                    else if (presenceType === 1) { presenceType = "On the website."; color = 0x00c9ff }
                                    else if (presenceType === 2) { presenceType = "Playing."; color = 0x00FF00 }
                                    else if (presenceType === 3) { presenceType = "Building in Studio."; color = 0xff9000 }
                                    else if (presenceType === 4) { presenceType = "Invisible."; color = 0x999999 }

                                    const mbed = new EmbedBuilder()
                                        .setColor(color)
                                        .setTitle(`Roblox player information.`)
                                        .setDescription(`General information on [${response1.data.name} (${response1.data.displayName})](https://www.roblox.com/users/${userid}/profile).`)
                                        .setThumbnail(`${pfpURL}`)
                                        .addFields(
                                            { name: 'Username:', value: `${response1.data.name}`, inline: true },
                                            { name: 'ID:', value: `${response1.data.id}`, inline: true },
                                            { name: 'Status:', value: `${presenceType}`, inline: true },
                                            { name: 'Last Online:', value: `<t:${parseInt(Date.parse(new Date(lastOnline)) / 1000)}:f>`, inline: true },
                                            { name: 'Created:', value: `<t:${parseInt(Date.parse(new Date(response1.data.created)) / 1000)}:f>`, inline: true },
                                            { name: '\u200B', value: '\u200B', inline: true },
                                            { name: 'Description:', value: `${desc}` }
                                        )
                                        .setTimestamp()
                                        .setFooter({ text: 'Spy' });

                                    await interaction.followUp({ embeds: [mbed] });
                                })

                                .catch(async function (error) {
                                    console.error(error);

                                    const mbed = new EmbedBuilder()
                                        .setColor(0xFF0000)
                                        .setTitle(`Error.`)
                                        .setDescription(`Axios error: ${error}`)
                                        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                                        .setTimestamp()
                                        .setFooter({ text: 'Spy' });

                                    await interaction.followUp({ embeds: [mbed] });
                                })
                        })

                        .catch(async function (error) {
                            console.error(error);

                            const mbed = new EmbedBuilder()
                                .setColor(0xFF0000)
                                .setTitle(`Error.`)
                                .setDescription(`Axios error: ${error}`)
                                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                                .setTimestamp()
                                .setFooter({ text: 'Spy' });

                            await interaction.followUp({ embeds: [mbed] });
                        });
                })

                .catch(async function (error) {
                    console.error(error);

                    const mbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle(`Error.`)
                        .setDescription(`Axios error: ${error}`)
                        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                        .setTimestamp()
                        .setFooter({ text: 'Spy' });

                    await interaction.followUp({ embeds: [mbed] });
                })

            })
            .catch(async function (error) {
                console.error(error);

                const mbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`Error.`)
                .setDescription(`No users found or the user is banned.`)
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                .setTimestamp()
                .setFooter({ text: 'Spy' });

                await interaction.followUp({ embeds: [mbed] });
            });
        }
    },
};