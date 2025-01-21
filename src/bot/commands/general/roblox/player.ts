import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandStringOption, ColorResolvable } from 'discord.js';
import axios from 'axios';

export default class robloxCommand implements botCommand {
    name: Lowercase<string> = "player";
    description: string = "Get information about a Roblox player.";
    spyBot: spyBot;
    options = [
        new SlashCommandStringOption()
            .setName('username')
            .setDescription('Player\'s username.')
            .setRequired(true)
    ]

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Error.')
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
            .setTimestamp()
            .setFooter({ text: 'Spy' });
        const key = this.spyBot.env.OPEN_CLOUD_API_KEY;
        const uname = interaction.options.getString('username', true);
        const responseId = await axios.post('https://users.roblox.com/v1/usernames/users', {
            "usernames": [
                `${uname}`
            ],
            "excludeBannedUsers": true
        });

        if (responseId.data.data.length === 0) {
            await interaction.followUp({ embeds: [errorEmbed.setDescription('No users have been found found or the user is banned.')] });
            return;
        };

        const userid = parseInt(responseId.data.data[0].id);
        const responsePresence = await axios.post('https://presence.roblox.com/v1/presence/users', {
            "userIds": [
                userid
            ]
        });
        const responseUser = await axios.get(`https://apis.roblox.com/cloud/v2/users/${userid}`, { headers: { 'x-api-key': key } });
        const desc = responseUser.data.about || 'No description provided.';
        const responseOperation = await axios.get(`https://apis.roblox.com/cloud/v2/users/${userid}:generateThumbnail?shape=SQUARE`, { headers: { 'x-api-key': key } });
        const pfpURL = responseOperation.data.response.imageUri;
        let color;

        let presenceType = responsePresence.data.userPresences[0].userPresenceType;
        const lastOnline = responsePresence.data.userPresences[0].lastOnline;

        if (presenceType === 0) { presenceType = "Offline."; color = Colors.Grey; }
        else if (presenceType === 1) { presenceType = "On the website."; color = Colors.Blue; }
        else if (presenceType === 2) { presenceType = "Playing."; color = Colors.Green; }
        else if (presenceType === 3) { presenceType = "Building in Studio."; color = Colors.Orange; }
        else if (presenceType === 4) { presenceType = "Invisible."; color = Colors.Grey; };

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(color as ColorResolvable)
                    .setTitle(`Roblox player information.`)
                    .setDescription(`General information on [${responseUser.data.name} (${responseUser.data.displayName})](https://www.roblox.com/users/${userid}/profile).`)
                    .setThumbnail(`${pfpURL}`)
                    .addFields(
                        { name: 'Username:', value: `${responseUser.data.name}`, inline: true },
                        { name: 'ID:', value: `${responseUser.data.id}`, inline: true },
                        { name: 'Is Premium:', value: `${responseUser.data.premium}`, inline: true },
                        { name: 'Status:', value: `${presenceType}`, inline: true },
                        { name: 'Last Online:', value: `<t:${Math.floor(Date.parse(new Date(lastOnline).toString()) / 1000)}:f>`, inline: true },
                        { name: 'Created:', value: `<t:${Math.floor(Date.parse(responseUser.data.createTime) / 1000)}:f>`, inline: true },
                        { name: 'Description:', value: `${desc}` }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
        return;
    }
}