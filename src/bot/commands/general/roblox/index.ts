import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction } from "discord.js";
import { botCommand } from "../../../../types/global.js";

export default class robloxCommand implements botCommand {
    name: Lowercase<string> = "roblox";
    description: string = "Interact with Roblox API.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}
