import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction } from "discord.js";
import { botCommand } from "../../../../types/global.js";

export default class settingsCommand implements botCommand {
    name: Lowercase<string> = "settings";
    description: string = "[ADMIN] Manage bot settings in this guild.";
    spyBot: spyBot;
    admin = true;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}
