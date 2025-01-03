const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('reboot')
        .setDescription('Reboot the bot and reload all components.'),
    async execute(interaction) {
        await interaction.deferReply();
        const ownerId = process.env.OWNER_ID;

        if (interaction.user.id === ownerId) {
            const mbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle(`Bot is rebooting...`)
                .setDescription(`Bot reboot is in progress. Please wait...`)
                .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                .setTimestamp()
                .setFooter({ text: 'Spy' });

            await interaction.editReply({ embeds: [mbed] });
            return process.exit();
        } else {
            const mbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle(`Error.`)
                .setDescription(`You are not authorized to run this command.`)
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                .setTimestamp()
                .setFooter({ text: 'Spy' });

            return await interaction.editReply({ embeds: [mbed] });
        }
    },
};