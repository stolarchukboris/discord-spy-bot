import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, Colors, MessageFlags } from 'discord.js';
import builder from 'djs-cv2-embed-builder';

export default class pingCommand implements botCommand {
    name: Lowercase<string> = "ping";
    description: string = "Check the websocket heartbeat.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new builder()
                    .setColor(Colors.Green)
                    .setTitle('Ping.')
                    .setDescription(`Websocket heartbeat: ${interaction.client.ws.ping} ms.`)
                    .setThumbnail(this.spyBot.logos.heart)
                    .setFooter('Spy Bot')
            ]
        });
        /*await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Fuchsia)
                    .setTitle(`Pong!`)
                    .setDescription(`Websocket heartbeat: ${interaction.client.ws.ping} ms.`)
                    .setThumbnail(this.spyBot.logos.heart)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });*/
    }
}
