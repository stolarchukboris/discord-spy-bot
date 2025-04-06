import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, SlashCommandStringOption, VoiceBasedChannel } from 'discord.js';

export default class musicCommand implements botCommand {
    name: Lowercase<string> = "play";
    description: string = "Blast a song in the VC!";
    spyBot: spyBot;
    vc = true;
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
        const url = interaction.options.getString('url', true);
        
        await this.spyBot.bot.distube.play(interaction.member.voice.channel as VoiceBasedChannel, url);
        await this.spyBot.sendEmbed(interaction, {
            type: 'success',
            message: 'Successfully added a song to the queue.'
        });
    }
}
