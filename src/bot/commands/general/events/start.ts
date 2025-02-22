import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandStringOption, TextChannel } from "discord.js";
import { botCommand } from "../../../../types/global.js";
import { eventCheck } from "../../../../misc/function.js";
import logos from '../../../../misc/logos.js';

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "start";
    description: string = "[EO+] Start a community event in this server.";
    spyBot: spyBot;
    eo = true;
    options = [
        new SlashCommandStringOption()
            .setName('event_id')
            .setDescription('ID of the event to be started.')
            .setRequired(true),
        new SlashCommandStringOption()
            .setName('join')
            .setDescription('A way to join your event.')
    ];

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">, channel: TextChannel, role: string): Promise<void> {
        const eventId = interaction.options.getString('event_id', true);
        const join = interaction.options.getString('join');
        const event = await eventCheck(this.spyBot, interaction, eventId, 2) as eventInfo;
        if (!event.eventGameName) return;

        await this.spyBot.knex<eventInfo>('communityEvents')
            .update({ eventStatus: 2 })
            .where('eventId', eventId);

        const gameName = event.eventGameName;
        const gameThumbnail = event.gameThumbnailUrl;
        let desc: string;

        if (!join) {
            desc = `The scheduled event in ${gameName} is starting now.`;
        } else {
            desc = `The scheduled event in ${gameName} is starting now.\n\n**Join the event:** ${join}`;
        }

        const annsMessage = channel.messages.cache.get(event.annsMessageId);

        if (annsMessage) await annsMessage.reply({
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

        await interaction.editReply({
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

        return;
    }
}
