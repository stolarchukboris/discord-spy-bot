import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { platform, release, machine, uptime } from 'os';
import path from 'path';
import moment from 'moment';
import 'moment-duration-format';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const __dirname = import.meta.dirname;
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJSON = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

function formatDuration(duration) {
    return moment.duration(duration).format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");
};

export const data = new SlashCommandBuilder()
    .setName('about')
    .setDescription('Get information about this bot.');
export async function execute(interaction) {
    await interaction.deferReply();

    let gitHash;

    try {
        gitHash = execSync('git rev-parse HEAD')
            .toString()
            .trim();
    } catch (error) {
        gitHash = 'Unknown.';
    };

    return await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Spy Information')
                .setDescription('Spy statistics and information. The bot repository can be found [here](https://github.com/PleasedontslammykeyboarddfsdoijfwR/discord-spy-bot).')
                .setFields([
                    {
                        name: "General Stats",
                        value: `\`\`\`yml\nName: ${interaction.client.user.username}#${interaction.client.user.discriminator}\nID: ${interaction.client.user.id}\`\`\``,
                        inline: true
                    },
                    {
                        name: "Bot Stats",
                        value: `\`\`\`yml\nGuilds: ${interaction.client.guilds.cache.size}\nUptime: ${formatDuration(interaction.client.uptime)}\nNodeJS: ${process.version}\nMemory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`\`\``,
                        inline: true
                    },
                    {
                        name: "System Stats",
                        value: `\`\`\`yml\nOS: ${platform() + " " + release()}\nArch: ${machine()}\nUptime: ${formatDuration(uptime() * 1000)}\n\`\`\``
                    },
                    {
                        name: "Build Stats",
                        value: `\`\`\`yml\nSpy: v${packageJSON.version}\nBuild: ${gitHash}\n\`\`\``,
                    },
                ])
                .setTimestamp()
                .setFooter({
                    text: 'Spy',
                    iconURL: interaction.client.user.avatarURL()
                })
        ]
    });
}