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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('group')
                .setDescription('Get information on Roblox group.')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('The name of the Roblox group.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const key = process.env.OPEN_CLOUD_API_KEY;

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error.')
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
            .setTimestamp()
            .setFooter({ text: 'Spy' });

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
                            axios.get(`https://apis.roblox.com/cloud/v2/users/${userid}`, { headers: { 'x-api-key': key } })
                                .then(async function (responseUser) {
                                    console.log(responseUser.data);

                                    axios.get(`https://apis.roblox.com/cloud/v2/users/${userid}:generateThumbnail?shape=SQUARE`, { headers: { 'x-api-key': key } })
                                        .then(async function (responseOperation) {
                                            let desc = responseUser.data.about;

                                            if (desc === '') {desc = 'No description provided.'};
                                            const pfpURL = responseOperation.data.response.imageUri;
                                            let color;

                                            if (pfpURL === '') { pfpURL = 'https://t0.rbxcdn.com/180DAY-28d85295af24ad566b19c1624b313b75' };

                                            let presenceType = responsePresence.data.userPresences[0].userPresenceType;
                                            const lastOnline = responsePresence.data.userPresences[0].lastOnline;

                                            if (presenceType === 0) { presenceType = "Offline."; color = 0x999999 }
                                            else if (presenceType === 1) { presenceType = "On the website."; color = 0x00c9ff }
                                            else if (presenceType === 2) { presenceType = "Playing."; color = 0x00FF00 }
                                            else if (presenceType === 3) { presenceType = "Building in Studio."; color = 0xff9000 }
                                            else if (presenceType === 4) { presenceType = "Invisible."; color = 0x999999 };

                                            const mbed = new EmbedBuilder()
                                                .setColor(color)
                                                .setTitle(`Roblox player information.`)
                                                .setDescription(`General information on [${responseUser.data.name} (${responseUser.data.displayName})](https://www.roblox.com/users/${userid}/profile).`)
                                                .setThumbnail(`${pfpURL}`)
                                                .addFields(
                                                    { name: 'Username:', value: `${responseUser.data.name}`, inline: true },
                                                    { name: 'ID:', value: `${responseUser.data.id}`, inline: true },
                                                    { name: 'Is Premium:', value: `${responseUser.data.premium}`, inline: true },
                                                    { name: 'Status:', value: `${presenceType}`, inline: true },
                                                    { name: 'Last Online:', value: `<t:${parseInt(Date.parse(new Date(lastOnline)) / 1000)}:f>`, inline: true },
                                                    { name: 'Created:', value: `<t:${parseInt(Date.parse(responseUser.data.createTime) / 1000)}:f>`, inline: true },
                                                    { name: 'Description:', value: `${desc}` }
                                                )
                                                .setTimestamp()
                                                .setFooter({ text: 'Spy' });

                                            await interaction.followUp({ embeds: [mbed] });
                                        })
                                        .catch(async error => {
                                            console.error(error);

                                            errorEmbed.setDescription(`${error}`);

                                            await interaction.followUp({ embeds: [errorEmbed] });
                                        })
                                })
                                .catch(async error => {
                                    console.error(error);

                                    errorEmbed.setDescription(`${error}`);

                                    await interaction.followUp({ embeds: [errorEmbed] });
                                })
                        })
                        .catch(async error => {
                            console.error(error);

                            errorEmbed.setDescription(`${error}`);

                            await interaction.followUp({ embeds: [errorEmbed] });
                        })
                })
                .catch(async error => {
                    console.error(error);

                    errorEmbed.setDescription(`No users found or the user is banned.`);

                    await interaction.followUp({ embeds: [errorEmbed] });
                })
        } else if (interaction.options.getSubcommand() === 'group') {
            const groupName = interaction.options.getString('name', true);

            axios.get(`https://groups.roblox.com/v1/groups/search/lookup?groupName=${groupName}`)
                .then(async groupResponse => {
                    const groupId = groupResponse.data.data[0].id;

                    axios.get(`https://apis.roblox.com/cloud/v2/groups/${groupId}`, { headers: { 'x-api-key': key } })
                        .then(async groupResponse1 => {
                            const data = groupResponse1.data;
                            const groupId = data.id;
                            const groupUrl = `https://www.roblox.com/${data.path}`;
                            const created = Math.round(Date.parse(data.createTime) / 1000);
                            const updated = Math.round(Date.parse(data.updateTime) / 1000);
                            const groupName = data.displayName;
                            const groupDesc = data.description ?? 'No description provided.';
                            const ownerUrl = `https://www.roblox.com/${data.owner}/profile`;
                            const groupMemberCount = data.memberCount;
                            const isPublicEntryAllowed = data.publicEntryAllowed;
                            const isLocked = data.locked;
                            const isVerified = data.verified;

                            axios.get(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupId}&size=150x150&format=webp&isCircular=false`)
                                .then(async thumbnailResponse => {
                                    const thumbnailUrl = thumbnailResponse.data.data[0].imageUrl;

                                    axios.get(`https://apis.roblox.com/cloud/v2/users/${data.owner.split('/')[1]}`, { headers: { 'x-api-key': key } })
                                        .then(async userResponse => {
                                            const ownerName = userResponse.data.name;

                                            const embed = new EmbedBuilder()
                                                .setColor(0x335FFF)
                                                .setThumbnail(thumbnailUrl)
                                                .setTitle(`Roblox group information.`)
                                                .setDescription(`Information on [${groupName}](${groupUrl}).`)
                                                .addFields(
                                                    { name: 'Name:', value: `${groupName}`, inline: true },
                                                    { name: 'Owner:', value: `[${ownerName}](${ownerUrl})`, inline: true },
                                                    { name: 'Member count:', value: `${groupMemberCount}`, inline: true },
                                                    { name: 'Is verified:', value: `${isVerified}`, inline: true },
                                                    { name: 'Created:', value: `<t:${created}:f>`, inline: true },
                                                    { name: 'Updated:', value: `<t:${updated}:f>`, inline: true },
                                                    { name: 'Is locked:', value: `${isLocked}`, inline: true },
                                                    { name: 'Is public entry allowed:', value: `${isPublicEntryAllowed}`, inline: true },
                                                    { name: 'Description:', value: `${groupDesc}` }
                                                )
                                                .setTimestamp()
                                                .setFooter({ text: 'Spy' });

                                            await interaction.followUp({ embeds: [embed] });
                                        })
                                        .catch(async error => {
                                            console.error(error);

                                            errorEmbed.setDescription(`Invalid request.`);

                                            await interaction.followUp({ embeds: [errorEmbed] });
                                        })
                                })
                                .catch(async error => {
                                    console.error(error);

                                    errorEmbed.setDescription(`${error}`);

                                    await interaction.followUp({ embeds: [errorEmbed] });
                                })


                        })
                        .catch(async error => {
                            console.error(error);

                            errorEmbed.setDescription(`${error}`);

                            await interaction.followUp({ embeds: [errorEmbed] });
                        })
                })
                .catch(async error => {
                    console.error(error);

                    errorEmbed.setDescription(`Group not found.`);

                    await interaction.followUp({ embeds: [errorEmbed] });
                })
        }
    },
};