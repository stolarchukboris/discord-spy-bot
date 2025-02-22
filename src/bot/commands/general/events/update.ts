import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, ColorResolvable, SlashCommandStringOption, SlashCommandIntegerOption, TextChannel } from "discord.js";
import { botCommand } from "../../../../types/global.js";
import { errorEmbed, sendError } from "../../../../misc/function.js";
import logos from '../../../../misc/logos.js';

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "update";
    description: string = "[EO+] Reschedule a community event in this server.";
    spyBot: spyBot;
    eo = true;
    options = [
        new SlashCommandStringOption()
            .setName('event_id')
            .setDescription('ID of the event to be rescheduled.')
            .setRequired(true),
        new SlashCommandIntegerOption()
            .setName('new_time')
            .setDescription('The new event time.')
            .setRequired(true)
    ];

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">, event: eventInfo, channel: TextChannel, role: string): Promise<void> {
        const eventId = interaction.options.getString('event_id', true);
        const time = interaction.options.getInteger('new_time', true);
        const eventAtThisTime = await this.spyBot.knex<eventInfo>('communityEvents')
            .select('*')
            .where('eventTime', '>=', time - 3600)
            .andWhere('eventTime', '<=', time + 3600)
            .andWhere('guildId', interaction.guild.id)
            .first();

        if ((event.eventTime == time) || (time <= Math.floor(Date.now() / 1000))) {
            await sendError(interaction, event.eventTime == time ? 'The event time must be changed when using this command.' : 'The event cannot be rescheduled to the past.');
            return;
        } else if (eventAtThisTime) {
            errorEmbed
                .setDescription('Schedule conflict. There is already an event scheduled for this time.')
                .setFields({ name: 'Event at this time', value: eventAtThisTime.eventId });

            await interaction.followUp({ embeds: [errorEmbed] });
            return;
        }

        await this.spyBot.knex<eventInfo>('communityEvents')
            .update({
                eventTime: time,
                reminded: false
            })
            .where('eventId', eventId);

        const gameName = event.eventGameName;
        const gameThumbnail = event.gameThumbnailUrl;
        const annsMessage = channel.messages.cache.get(event.annsMessageId);
        if (annsMessage) {
            await annsMessage.reply({
                content: `<@&${role}>`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x2B2D31)
                        .setTitle(`The event has been rescheduled.`)
                        .setDescription(`The event in ${gameName} has been rescheduled.\n\n**Please adjust your availability accordingly.**`)
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
                        .setColor(annsMessage.embeds[0].hexColor as ColorResolvable)
                        .setTitle(`Event in ${gameName} has been scheduled on <t:${time}:f>!`)
                        .setFields(annsMessage.embeds[0].fields)
                        .setDescription(annsMessage.embeds[0].description)
                        .setThumbnail(annsMessage.embeds[0].thumbnail?.url as string)
                        .setTimestamp()
                        .setFooter(annsMessage.embeds[0].footer)
                ]
            });
        } 

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('The event has been rescheduled successfully.')
                    .setFields(
                        { name: 'New Time', value: `<t:${time}:f>` },
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
