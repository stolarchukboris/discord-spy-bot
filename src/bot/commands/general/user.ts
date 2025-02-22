import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandUserOption } from 'discord.js';

export default class userCommand implements botCommand {
    name: Lowercase<string> = "user";
    description: string = "Get information about the specified Discord user.";
    spyBot: spyBot;
    options = [
        new SlashCommandUserOption()
            .setName('user')
            .setDescription('User to fetch. Ignore to get info on yourself.')
    ];

    constructor (spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const opt = interaction.options.getUser('user') ?? interaction.user;
        const joined = interaction.member.joinedTimestamp ?? 0;

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Server member information.')
                    .setDescription(`Get information about ${opt}.`)
                    .setThumbnail(`${opt.avatarURL()}`)
                    .addFields(
                        { name: 'Username:', value: `${opt.username}`, inline: true },
                        { name: 'Join date:', value: `<t:${Math.floor(joined / 1000)}:f>`, inline: true },
                        { name: 'ID:', value: `${opt.id}`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        })
        return;
    }
}