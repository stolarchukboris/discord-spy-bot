import { spyBot } from "../../../../index.js";
import { ApplicationCommandOptionBase, ChatInputCommandInteraction } from "discord.js";
import { botCommand } from "../../../../types/global.js";

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "events";
    description: string = "[EO+] Manage community events in this server.";
    spyBot: spyBot;
    eo = true;
    options = [];

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        return Promise.resolve(undefined);
    }
}
