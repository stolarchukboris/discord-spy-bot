import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';

export default class serverCommand implements botCommand {
    name: Lowercase<string> = "server";
    description: string = "Get information about this Discord server.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Server information.')
                    .setDescription('Get information about the server.')
                    .setThumbnail(`${interaction.guild.iconURL()}`)
                    .addFields(
                        { name: 'Server name:', value: `${interaction.guild.name}`, inline: true },
                        { name: 'Server owner:', value: `<@${interaction.guild.ownerId}>`, inline: true },
                        { name: 'Created:', value: `<t:${Math.round(interaction.guild.createdTimestamp / 1000)}:f>`, inline: true },
                        { name: 'Member count:', value: `${interaction.guild.memberCount}`, inline: true },
                        { name: 'Server boosts:', value: `${interaction.guild.premiumSubscriptionCount ?? 0}`, inline: true },
                        { name: 'Maximum server bitrate:', value: `${interaction.guild.maximumBitrate}`, inline: true },
                        { name: 'Server description:', value: `${interaction.guild.description ?? 'No description provided.'}` }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    }
}