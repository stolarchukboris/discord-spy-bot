import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import { botCommand } from "../../../../types/global.js";
import axios from "axios";

export default class robloxCommand implements botCommand {
    name: Lowercase<string> = "restart_servers";
    description: string = "Restart all game servers for update.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await axios.post('https://apis.roblox.com/cloud/v2/universes/17732632308:restartServers', {
            headers: {
                'x-api-key': this.spyBot.env.OPEN_CLOUD_API_KEY
            }
        });

        await this.spyBot.sendEmbed(interaction, {
            type: 'success',
            message: 'Successfully restarted the game servers.'
        });
    }
}
