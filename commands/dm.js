const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Send a direct message to a server member.')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('The user to send the message to.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message to be sent.')
        )
        .addAttachmentOption(option =>
            option
                .setName('attachment')
                .setDescription('The attachment to send in a message')
        )
        .addBooleanOption(option =>
            option
                .setName('anonymous')
                .setDescription('(Defaults to TRUE) Should your name be kept unmentioned in the DM headline?')
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('member', true);
        const message = interaction.options.getString('message');
        const attachment = interaction.options.getAttachment('attachment');
        const anonymous = interaction.options.getBoolean('anonymous') ?? true;
        const embedToSend = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`You've Got Mail!`)
            .setTimestamp()
            .setFooter({ text: 'Spy' });

        let author = `.`;

        if (!anonymous) {
            author = ` (<@${interaction.user.id}>).`;
        };

        if (attachment && !message) {
            embedToSend
                .setImage(attachment.url)
                .setDescription(`You have received a message${author}`);
        } else if (!attachment && message) {
            embedToSend
                .setDescription(`You have received a message${author}\n\n${message}`);
        } else if (attachment && message) {
            embedToSend
                .setDescription(`You have received a message${author}\n\n${message}`)
                .setImage(attachment.url);
        } else if (!attachment && !message) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle('Error.')
                        .setDescription('Cannot send an empty message.')
                        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            })
        }
        try {
            await user.send({
                embeds: [embedToSend]
            });
        } catch (error) {
            if (error.code === 50007) {
                return await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Yellow)
                            .setTitle(`Error.`)
                            .setDescription(`Cannot send a message to <@${user.id}> because the user has this bot blocked.`)
                            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
                            .setTimestamp()
                            .setFooter({ text: 'Spy' })
                    ]
                });
            }
        }

        return await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle(`Direct message sent.`)
                    .setDescription(`Successfully sent a direct message to <@${user.id}>.`)
                    .setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    },
};