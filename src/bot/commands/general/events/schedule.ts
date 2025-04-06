import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandStringOption, SlashCommandIntegerOption, TextChannel } from "discord.js";
import { botCommand } from "../../../../types/global.js";
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
    ];

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">, channel: TextChannel, role: string): Promise<void> {
        const gameUrl = interaction.options.getString('game_url', true);
        const time = interaction.options.getInteger('time', true);
        const duration = interaction.options.getString('duration') ?? 'Not specified.';
        const comment = interaction.options.getString('comment');
        const existingEvent = await this.spyBot.knex<eventInfo>('communityEvents')
            .select('*')
            .where('eventTime', '>=', time - 3600)
            .andWhere('eventTime', '<=', time + 3600)
            .andWhere('guildId', interaction.guild.id)
            .first();

        if (existingEvent) {
            await this.spyBot.sendEmbed(interaction, {
                type: 'warning',
                message: 'There is already an event scheduled for this time.'
            });
            return;
        }

        if (time <= Math.round(Date.now() / 1000)) {
            await this.spyBot.sendEmbed(interaction, {
                type: 'warning',
                message: 'The event cannot be scheduled in the past.'
            });
            return;
        }

        const eventId = crypto.randomUUID();
        const placeid = gameUrl.split('/')[4];
        let gameResponse;

        try {
            gameResponse = await axios.get(`https://www.roblox.com/places/api-get-details?assetId=${placeid}`);
        } catch (error) {
            await this.spyBot.sendEmbed(interaction, {
                type: 'warning',
                message: 'Could not find the provided game.'
            });
            return;
        }

        const gameName: string = gameResponse.data.Name;
        let eventDesc: string;

        if (!comment) {
            eventDesc = `**Event duration**: ${duration}\n\n**This event is going to take place in** [${gameName}](${gameUrl}).\n\n**React with :white_check_mark: if you're planning to attend this event.**`;
        } else {
            eventDesc = `**Event duration**: ${duration}\n\n**This event is going to take place in** [${gameName}](${gameUrl}).\n\n**Note from host:** ${comment}\n\n**React with :white_check_mark: if you're planning to attend this event.**`;
        }

        const thumbnailResponse = await axios.get(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeid}&returnPolicy=PlaceHolder&size=150x150&format=Webp&isCircular=false`);
        const gameThumbnail: string = thumbnailResponse.data.data[0].imageUrl;

        await this.spyBot.knex<eventInfo>('communityEvents')
            .insert({
                eventId: eventId,
                guildId: interaction.guild.id,
                eventHost: interaction.user.id,
                eventGameUrl: gameUrl,
                eventGameName: gameName,
                gameThumbnailUrl: gameThumbnail,
                eventTime: time
            });

        const sentAnns = await channel.send({
            content: `<@&${role}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`Event in ${gameName} has been scheduled on <t:${time}:f>!`)
                    .setDescription(eventDesc)
                    .setFields(
                        { name: 'Event Host', value: `${interaction.user.id}`, inline: true },
                        { name: 'Event ID', value: eventId, inline: true }
                    )
                    .setThumbnail(gameThumbnail)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });

        await sentAnns.react('✅');
        await channel.send(gameUrl);
        await this.spyBot.knex<eventInfo>('communityEvents')
            .update({ annsMessageId: sentAnns.id })
            .where('eventId', eventId);
        await this.spyBot.sendEmbed(interaction, {
            type: 'success',
            message: 'Successfully scheduled an event.',
            fields: [{ name: 'Event ID', value: eventId }]
        });
        return;
    }
}
