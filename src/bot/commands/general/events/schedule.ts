import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, GuildChannel, SlashCommandStringOption, SlashCommandIntegerOption } from "discord.js";
import { botCommand } from "../../../../types/global.js";
import logos from '../../../../misc/logos.js';
import axios from 'axios';

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "schedule";
    description: string = "[EO+] Schedule a community event in this server.";
    spyBot: spyBot;
    eo = true;
    options = [
        new SlashCommandStringOption()
            .setName('game_url')
            .setDescription('URL to the event game.')
            .setRequired(true),
        new SlashCommandIntegerOption()
            .setName('time')
            .setDescription('UNIX timestamp of the event date.')
            .setRequired(true),
        new SlashCommandStringOption()
            .setName('duration')
            .setDescription('Event duration (text).'),
        new SlashCommandStringOption()
            .setName('comment')
            .setDescription('Optional comment about the upcoming event.')
    ]

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Error.')
            .setThumbnail(logos.warning)
            .setTimestamp()
            .setFooter({ text: 'Spy' });
        const channelSetting = await this.spyBot.knex('eventAnnsChannelSetting')
            .select('*')
            .where('guildId', interaction.guild.id)
            .first();
        const roleSetting = await this.spyBot.knex('eventPingRoleSetting')
            .select('*')
            .where('guildId', interaction.guild.id)
            .first();

        if (!channelSetting) {
            errorEmbed.setDescription(`Event announcements channel setting not configured.`);

            await interaction.followUp({ embeds: [errorEmbed] });
            return;
        };

        if (!roleSetting) {
            errorEmbed.setDescription(`Event ping role not configured.`)

            await interaction.followUp({ embeds: [errorEmbed] });
            return;
        };

        const role = roleSetting.settingValue;
        const channel = interaction.client.channels.cache.get(channelSetting.settingValue) as GuildChannel;
        if (!channel?.isTextBased()) return;

        const gameUrl = interaction.options.getString('game_url', true);
        const time = interaction.options.getInteger('time', true);
        const duration = interaction.options.getString('duration') ?? 'Not specified.';
        const comment = interaction.options.getString('comment') ?? '';
        const existingEvent = await this.spyBot.knex('communityEvents')
            .select('*')
            .where('eventTime', time)
            .andWhere('guildId', interaction.guild.id)
            .first();

        if (existingEvent) {
            errorEmbed.setDescription(`There's already an event scheduled for this time.`);

            await interaction.followUp({ embeds: [errorEmbed] });
            return;
        };

        if (time <= Math.round(Date.now() / 1000)) {
            errorEmbed.setDescription(`Cannot schedule an event in the past.`);

            await interaction.followUp({ embeds: [errorEmbed] });
            return;
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

        await this.spyBot.knex.raw(
            `insert into communityEvents(guildId, eventId, eventHost, eventGameUrl, eventGameName, gameThumbnailUrl, eventTime) values (?, ?, ?, ?, ?, ?, ?)`,
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
        await this.spyBot.knex('communityEvents')
            .update({ annsMessageId: sentAnns.id })
            .where('eventId', eventId);
        await interaction.followUp({
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

        return;
    }
}
