import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction } from 'discord.js';

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
        await this.spyBot.sendEmbed(interaction, {
            type: 'success',
            message: 'Successfully paused the music playback.'
        });
    }
}
