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

        const { stdout, stderr } = spawn('pnpm run rebuild', { shell: true });

        stderr.on('data', async (data) => {
            console.log(`stderr: ${data}`);

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle('stderr')
                        .setDescription('Console has returned some warnings or information.')
                        .setFields([
                            { name: 'Output', value: `\`\`\`\n${data}\`\`\`` },
                        ])
                        .setTimestamp()
                        .setFooter({ text: interaction.guild.name })
                ]
            });
        });

        stdout.on('data', async (data) => {
            console.log(`stdout: ${data}`);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blurple)
                        .setTitle('Rebuild Operation')
                        .setDescription('Rebuilding the bot, watch output for results...')
                        .setFields([
                            { name: 'Output', value: `\`\`\`\n${data}\`\`\`` },
                        ])
                        .setTimestamp()
                        .setFooter({ text: interaction.guild.name })
                ]
            });
        });
    }
}