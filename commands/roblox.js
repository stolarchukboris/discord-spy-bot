const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const key = process.env.OPEN_CLOUD_API_KEY;

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
            .then(async function (responseId) {
                const userid = parseInt(responseId.data.data[0].id);

                axios.post('https://presence.roblox.com/v1/presence/users', {
                    "userIds": [
                        userid
                    ]
                })
                .then(async function (responsePresence) {
                    axios.get(`https://apis.roblox.com/cloud/v2/users/${userid}`, {
                        headers: {
                            'x-api-key': key
                        }
                    })
                        .then(async function (responseUser) {
                            axios.get(`https://apis.roblox.com/cloud/v2/users/${userid}:generateThumbnail?shape=SQUARE`, {
                                headers: {
                                    'x-api-key': key
                                }
                            })
                                .then(async function (responseOperation) {
                                    const pfpURL = responseOperation.data.response.imageUri
                                    
                                    let color;

                                    if (pfpURL === '') {pfpURL = 'https://t0.rbxcdn.com/180DAY-28d85295af24ad566b19c1624b313b75'}
                                    
                                    let desc = responseUser.data.about;
                                    let presenceType = responsePresence.data.userPresences[0].userPresenceType;
                                    const lastOnline = responsePresence.data.userPresences[0].lastOnline;

                                    if (desc === "") { desc = "No description provided." }
                                    if (presenceType === 0) { presenceType = "Offline."; color = 0x999999 }
                                    else if (presenceType === 1) { presenceType = "On the website."; color = 0x00c9ff }
                                    else if (presenceType === 2) { presenceType = "Playing."; color = 0x00FF00 }
                                    else if (presenceType === 3) { presenceType = "Building in Studio."; color = 0xff9000 }
                                    else if (presenceType === 4) { presenceType = "Invisible."; color = 0x999999 }

                                    const mbed = new EmbedBuilder()
                                        .setColor(color)
                                        .setTitle(`Roblox player information.`)
                                        .setDescription(`General information on [${responseUser.data.name} (${responseUser.data.displayName})](https://www.roblox.com/users/${userid}/profile).`)
                                        .setThumbnail(`${pfpURL}`)
                                        .addFields(
                                            { name: 'Username:', value: `${responseUser.data.name}`, inline: true },
                                            { name: 'ID:', value: `${responseUser.data.id}`, inline: true },
                                            { name: 'Status:', value: `${presenceType}`, inline: true },
                                            { name: 'Is Premium:', value: `${responseUser.data.premium}`, inline: true },
                                            { name: 'Last Online:', value: `<t:${parseInt(Date.parse(new Date(lastOnline)) / 1000)}:f>`, inline: true },
                                            { name: 'Created:', value: `<t:${parseInt(Date.parse(responseUser.data.createTime) / 1000)}:f>`, inline: true },
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
                                        .setDescription(`${error}`)
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
                                .setDescription(`${error}`)
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
                        .setDescription(`${error}`)
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