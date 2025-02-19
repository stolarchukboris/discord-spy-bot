import { createAudioPlayer } from '@discordjs/voice';
import { connectToChannel, playSong } from '../../../misc/helpers.js';
import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandStringOption } from 'discord.js';
import logos from '../../../misc/logos.js';

export default class musicCommand implements botCommand {
    name: Lowercase<string> = "play";
    description: string = "Blast a song in the VC!";
    spyBot: spyBot;
    options = [
        new SlashCommandStringOption()
            .setName('url')
            .setDescription('URL to the music source.')
            .setRequired(true)
    ];

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        if (!(interaction.inGuild() && interaction.member.voice.channel)) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle('Error.')
                        .setDescription('Please join a Voice Channel to play music.')
                        .setThumbnail(logos.warning)
                        .setTimestamp()
                        .setFooter({ text: 'Spy Music' })
                ]
            })
            return;
        }

        const url = interaction.options.getString('url', true);
        const player = createAudioPlayer();
        
        await playSong(player, url);

        const connection = await connectToChannel(interaction.member.voice.channel);

        connection.subscribe(player);

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('Started playing the requested music.')
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy Music' })
            ]
        })

        return;
    }
}