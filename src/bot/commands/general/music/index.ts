import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction } from "discord.js";
import { botCommand } from "../../../../types/global.js";

export default class musicCommand implements botCommand {
    name: Lowercase<string> = "music";
    description: string = "Interact with the music player.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}
