import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import { spawn } from 'child_process';

export default class rebuildCommand implements botCommand {
    name: Lowercase<string> = "rebuild";
    description: string = "[DEV] Rebuild a bot and restart.";
    spyBot: spyBot;
    developer = true;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        spawn('pnpm run rebuild', { shell: true });

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Rebuilding...')
                    .setDescription('Bot rebuild and reboot is in progress. Please wait...')
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    }
}