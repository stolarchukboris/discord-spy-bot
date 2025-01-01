const { spawn } = require('child_process');
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pull')
        .setDescription('[DEV] Pull latest changes from Git Main and restart.'),
    async execute(interaction) {
        await interaction.deferReply();

        if (interaction.user.id === process.env.OWNER_ID) {
            await interaction.editReply('`Pulling...`')

            const { stdout, stderr } = spawn('git pull', { shell: true });

            stderr.on('data', async (data) => {
                console.log(`stderr: ${data}`);

                await interaction.editReply({
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

                await new Promise(resolve => setTimeout(resolve, 30_000));
                return process.exit();
            });
        } else {
            const mbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`Error.`)
                .setDescription(`You are not authorized to run this command.`)
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                .setTimestamp()
                .setFooter({ text: 'Spy' });

            return await interaction.editReply({ embeds: [mbed] });
        };
    }
};