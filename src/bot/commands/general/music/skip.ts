import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction } from 'discord.js';

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
        
        await this.spyBot.sendEmbed(interaction, {
            type: 'success',
            message: `Successfully skipped to \`${song.name}\`.`
        });
    }
}
