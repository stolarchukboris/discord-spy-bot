import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import logos from '../../../../misc/logos.js';

export default class musicCommand implements botCommand {
    name: Lowercase<string> = "skip";
    description: string = "Skip the current song.";
    spyBot: spyBot;
    vc = true;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const song = await this.spyBot.bot.distube.skip(interaction.guild);
        
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Skipped to \`${song.name}\`.`)
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy Music' })
            ]
        })

        return;
    }
}