const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ownerId = process.env.OWNER_ID;

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('reboot')
        .setDescription('Reboot the bot and reload all components.'),
    async execute(interaction) {
        if (interaction.user.id === ownerId) {
            const mbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`Bot is rebooting...`)
                .setDescription(`Bot reboot is in progress. Please wait...`)
                .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                .setTimestamp()
                .setFooter({ text: 'Spy'});

            await interaction.reply({ embeds: [mbed] });
            process.exit();
        } else {
            const mbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`Error.`)
                .setDescription(`You are not authorized to run this command.`)
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                .setTimestamp()
                .setFooter({ text: 'Spy'});

            await interaction.reply({ embeds: [mbed] });
        }
    },
};