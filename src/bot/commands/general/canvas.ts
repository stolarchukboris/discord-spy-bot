import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import Canvas from '@napi-rs/canvas';

export default class canvasCommand implements botCommand {
    name: Lowercase<string> = "canvas";
    description: string = "Canvas package test.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        // Create a 700x250 pixel canvas and get its context
        // The context will be used to modify the canvas
        const canvas = Canvas.createCanvas(700, 250);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage('static\\background.jpg');
        const avatar = await Canvas.loadImage(interaction.user.avatarURL() as string);

        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        context.drawImage(avatar, 20, 20, 200, 200);

        // Use the helpful Attachment class structure to process the file for you
        const thing = new AttachmentBuilder(await canvas.encode('png'), { name: 'yourimage.png' });
        
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('You.')
                    .setDescription('This is you')
                    .setImage('attachment://yourimage.png')
            ],
            files: [thing]
        });
    }
}
