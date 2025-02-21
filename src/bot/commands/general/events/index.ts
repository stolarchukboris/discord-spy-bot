import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction } from "discord.js";
import { botCommand } from "../../../../types/global.js";

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "events";
    description: string = "[EO+] Manage community events in this server.";
    spyBot: spyBot;
    eo = true;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    execute(interaction: ChatInputCommandInteraction<"cached">, channelSetting: any, roleSetting: any): Promise<void> {
        return Promise.resolve(undefined);
    }
}
