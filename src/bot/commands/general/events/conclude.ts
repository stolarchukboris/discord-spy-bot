import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandStringOption, TextChannel } from "discord.js";
import { botCommand } from "../../../../types/global.js";

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

    async execute(interaction: ChatInputCommandInteraction<"cached">, event: eventInfo, channel: TextChannel): Promise<void> {
        const eventId = interaction.options.getString('event_id', true);
        const comment = interaction.options.getString('comment');

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

        await this.spyBot.sendEmbed(interaction, {
            type: 'success',
            message: 'Successfully concluded the scheduled event.'
        });
    }
}
