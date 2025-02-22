import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandStringOption, TextChannel } from "discord.js";
import { botCommand } from "../../../../types/global.js";
import { eventCheck } from "../../../../misc/function.js";
import logos from '../../../../misc/logos.js';

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "conclude";
    description: string = "[EO+] Conclude a community event in this server.";
    spyBot: spyBot;
    eo = true;
    options = [
        new SlashCommandStringOption()
            .setName('event_id')
            .setDescription('ID of the event to be concluded.')
            .setRequired(true),
        new SlashCommandStringOption()
            .setName('comment')
            .setDescription('Optional comment about the concluded event.')
    ];

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">, channel: TextChannel): Promise<void> {
        const eventId = interaction.options.getString('event_id', true);
        const comment = interaction.options.getString('comment');
        const event = await eventCheck(this.spyBot, interaction, eventId, 1) as eventInfo;
        if (!event.eventGameName) return;

        await this.spyBot.knex<eventInfo>('communityEvents')
            .del()
            .where('eventId', eventId);

        const gameName = event.eventGameName;
        const gameThumbnail = event.gameThumbnailUrl;
        let desc: string;

        if (!comment) {
            desc = `The scheduled event in ${gameName} has been concluded. Thank you for attending!`;
        } else {
            desc = `The scheduled event in ${gameName} has been concluded. Thank you for attending!\n\n**Comment from host:** ${comment}`;
        }

        const annsMessage = channel.messages.cache.get(event.annsMessageId);

        if (annsMessage) await annsMessage.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`The scheduled event has been concluded.`)
                    .setDescription(desc)
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
                    .setDescription('The scheduled event has been concluded successfully.')
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
        return;
    }
}
