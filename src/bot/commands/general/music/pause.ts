import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import logos from '../../../../misc/logos.js';

export default class musicCommand implements botCommand {
    name: Lowercase<string> = "pause";
    description: string = "Pause the music player.";
    spyBot: spyBot;
    vc = true;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await this.spyBot.bot.distube.pause(interaction);
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Paused the music playback.`)
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy Music' })
            ]
        })

        return;
    }
}