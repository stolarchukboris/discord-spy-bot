import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { logos } from '../misc/logos.js';

export const data = new SlashCommandBuilder()
    .setName('dm')
    .setDescription('[MOD+] Send a direct message to a server member.')
    .addUserOption(option => option
        .setName('member')
        .setDescription('The user to send the message to.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('message')
        .setDescription('The message to be sent.')
    )
    .addAttachmentOption(option => option
        .setName('attachment')
        .setDescription('The attachment to send in a message')
    )
    .addBooleanOption(option => option
        .setName('anonymous')
        .setDescription('(Defaults to TRUE) Should your name be kept unmentioned in the DM headline?')
    );
export async function execute(interaction) {
    await interaction.deferReply();

    const knex = interaction.client.knex;
    const setting = await knex('modUsersRolesSetting')
        .select('*')
        .where('guildId', interaction.guild.id);
    const allowedIds = setting.map(setting => setting.settingValue);

    if (!(allowedIds.includes(interaction.user.id) || interaction.member.roles.cache.hasAny(...allowedIds) || interaction.memberPermissions.has('Administrator'))) {
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Error.')
                    .setDescription('You are not authorized to run this command.')
                    .setThumbnail(logos.warning)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    };

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
                    .setThumbnail(logos.warning)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
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
                        .setThumbnail(logos.warning)
                        .setTimestamp()
                        .setFooter({ text: 'Spy' })
                ]
            });
        };
    };

    return await interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle(`Direct message sent.`)
                .setDescription(`Successfully sent a direct message to <@${user.id}>.`)
                .setThumbnail(logos.checkmark)
                .setTimestamp()
                .setFooter({ text: 'Spy' })
        ]
    });
};