import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import { spawn } from 'child_process';

export default class pullCommand implements botCommand {
    name: Lowercase<string> = "pull";
    description: string = "[DEV] Pull latest changes from Git Main.";
    spyBot: spyBot;
    developer = true;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const { stdout, stderr } = spawn('git pull', { shell: true });

        stderr.on('data', async (data) => {
            console.log(`stderr: ${data}`);

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle('stderr')
                        .setDescription('There are some warnings or information that console gave')
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
                        .setTitle('Pull Operation')
                        .setDescription('The command is being executed, watch output for results.')
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