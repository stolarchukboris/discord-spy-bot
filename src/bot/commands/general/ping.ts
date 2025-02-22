import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import logos from '../../../misc/logos.js';

export default class pingCommand implements botCommand {
    name: Lowercase<string> = "ping";
    description: string = "Check the websocket heartbeat.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle(`Pong!`)
                    .setDescription(`Websocket heartbeat: ${interaction.client.ws.ping} ms.`)
                    .setThumbnail(logos.heart)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
        return;
    }
}