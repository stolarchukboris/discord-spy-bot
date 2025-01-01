const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');
const os = require("os");
const packageJSON = require("../../package.json");

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Get information on the bot and bot host.'),
    async execute(interaction) {
        let str = ``;
        for (const [k, v] of Object.entries(packageJSON.dependencies)) {
            str = str.concat(`${k}: ${v}\n`);
        }

        const uptime = Math.floor(process.uptime());
        const date = new Date(0);

        date.setSeconds(uptime);
        const uptimeStr = date.toISOString().substring(11, 19);

        const mbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`Spy`)
            .setDescription(`Spy bot is brought to you by <@${process.env.OWNER_ID}>. You can visit the bot's GitHub repository [here](https://github.com/PleasedontslammykeyboarddfsdoijfwR/discord-spy-bot).`)
            .addFields(
                { name: 'Host System', value: codeBlock('yaml', `OS: ${os.machine()} ${os.platform()}-${os.release()}\nCPU: ${os.arch()} ${os.cpus()[0].model}\nUsed RAM: ${Math.round((os.totalmem() - os.freemem()) / 1048576)} MB\nUptime: ${new Date(os.uptime() * 1000).toISOString().substring(11, 19)}`) },
                { name: 'Bot', value: codeBlock('yaml', `Used RAM: ${Math.round(process.memoryUsage().heapUsed / 1048576)} MB\nUptime: ${uptimeStr}`), inline: true },
                { name: 'Dependencies', value: codeBlock('yaml', `${str}`), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Spy' });

        return await interaction.reply({ embeds: [mbed] });
    },
};