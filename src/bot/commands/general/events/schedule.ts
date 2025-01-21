import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction } from "discord.js";
import { botCommand } from "../../../../types/global.js";

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "schedule";
    description: string = "[EO+] Schedule a community event in this server.";
    spyBot: spyBot;
    eo = true;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        

        return;
    }
}
