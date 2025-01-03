const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const os = require('os');
const packageJSON = require("../../package.json");
const moment = require('moment');
require('moment-duration-format');
const child_process = require('child_process');

function formatDuration(duration) {
    return moment.duration(duration).format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");
};

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Get information about this bot.'),
    async execute(interaction) {
        await interaction.deferReply();

        let gitHash;

        try {
            gitHash = child_process
                .execSync('git rev-parse HEAD')
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
                            value: `\`\`\`yml\nOS: ${os.platform() + " " + os.release()}\nArch: ${os.machine()}\nUptime: ${formatDuration(os.uptime() * 1000)}\n\`\`\``
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
};