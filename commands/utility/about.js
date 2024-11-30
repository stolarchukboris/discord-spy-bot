const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');
const os = require("os");
const packageJSON = require("../../package.json");

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Get information on the bot and bot host.'),
    async execute(interaction) {
        const axiosVersion = packageJSON.dependencies["axios"];
        const discordJSVersion = packageJSON.dependencies["discord.js"];
        const uptime = Math.floor(process.uptime());
        const date = new Date(0);

        date.setSeconds(uptime);
        const uptimeStr = date.toISOString().substring(11, 19);

        const mbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`Spy`)
            .setDescription(`Information on Spy bot.`)
            .addFields(
                { name: 'Host System', value: codeBlock('yaml', `OS: ${os.machine()} ${os.platform()}-${os.release()}\nCPU: ${os.arch()} ${os.cpus()[0].model}\nUsed RAM: ${Math.round((os.totalmem() - os.freemem()) / 1048576)} MB\nUptime: ${new Date(os.uptime() * 1000).toISOString().substring(11, 19)}`) },
                { name: 'Bot', value: codeBlock('yaml', `Used RAM: ${Math.round(process.memoryUsage().heapUsed / 1048576)} MB\nUptime: ${uptimeStr}\nNode: ${process.version}\nDiscordJS: ${discordJSVersion}\nAxios: ${axiosVersion}`) }
            )
            .setTimestamp()
            .setFooter({ text: 'Spy'});

        await interaction.reply({embeds: [mbed]});
    },
};