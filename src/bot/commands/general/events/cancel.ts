import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandStringOption, TextChannel } from "discord.js";
import { botCommand } from "../../../../types/global.js";
import { eventCheck } from "../../../../misc/function.js";
import logos from '../../../../misc/logos.js';

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "cancel";
    description: string = "[EO+] Cancel a community event in this server.";
    spyBot: spyBot;
    eo = true;
    options = [
        new SlashCommandStringOption()
            .setName('event_id')
            .setDescription('ID of the event to be cancelled.')
            .setRequired(true),
        new SlashCommandStringOption()
            .setName('reason')
            .setDescription('The reason for the event cancellation.')
            .setRequired(true)
    ];

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">, channel: TextChannel, role: string): Promise<void> {
        const eventId = interaction.options.getString('event_id', true);
        const reason = interaction.options.getString('reason', true);
        const event = await eventCheck(this.spyBot, interaction, eventId) as eventInfo;
        if (!event.eventGameName) return;
        
        await this.spyBot.knex<eventInfo>('communityEvents')
            .del()
            .where('eventId', eventId);

        const gameName = event.eventGameName;
        const gameThumbnail = event.gameThumbnailUrl;
        const annsMessage = channel.messages.cache.get(event.annsMessageId);

        if (annsMessage) await annsMessage.reply({
            content: `<@&${role}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`The scheduled event has been cancelled.`)
                    .setDescription(`The scheduled event in ${gameName} has been cancelled.\n\nSorry for the inconvenience!`)
                    .setFields({ name: 'Reason', value: `${reason}` })
                    .setThumbnail(gameThumbnail)
                    .setTimestamp()
                    .setFooter({ text: `Spy` })
            ]
        });

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('The scheduled event has been cancelled and deleted successfully.')
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
        return;
    }
}
