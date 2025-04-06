import { config } from 'dotenv';
import knex, { Knex } from 'knex';
import Bot from './bot/bot.js';
import logos from './misc/logos.js';
import settingsEnum from './misc/settingsEnum.js';
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import { premadeEmbedOptions } from './types/global.js';

export enum botState {
    OFF, START, ON, STOP
}

class spyBotObject {
    state: botState = botState.OFF;
    env = config().parsed || {};
    knex: Knex;
    bot: Bot;
    logos = logos;
    settings = settingsEnum;

    constructor() {
        console.log('Starting...');
        this.state = botState.START;

        console.log('Connecting to DB...');
        this.knex = knex({
            client: 'mysql2',
            connection: {
                host: '127.0.0.1',
                port: parseInt(this.env.DB_PORT, 10),
                user: this.env.DB_USER,
                password: this.env.DB_PASS,
                database: this.env.DB_SCHEMA
            }
        });

        console.log("Initializing the Discord bot...");
        this.bot = new Bot(this);
    }

    /**
     * Sends an embed of a selected type as an interaction response.
     * 
     * @param {ChatInputCommandInteraction} interaction Interaction to respond to.
     * @param {premadeEmbedOptions} options Embed {@link premadeEmbedOptions | options}.
     * 
     * @returns An embed interaction response.
     */
    async sendEmbed(interaction: ChatInputCommandInteraction, options: premadeEmbedOptions) {
        let embed;

        if (options.type === 'accessDenied') {
            embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Access denied.')
                .setDescription(options.message ?? 'You are not authorized to run this command.')
                .setThumbnail(spyBot.logos.warning)
                .setTimestamp()
                .setFooter({ text: 'Spy' });
        } else if (options.type === 'error') {
            embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Error.')
                .setDescription(options.message ?? 'An error has occured while executing this command.')
                .setThumbnail(spyBot.logos.warning)
                .setTimestamp()
                .setFooter({ text: 'Spy' });
        } else if (options.type === 'warning') {
            embed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle('Warning.')
                .setDescription(options.message ?? 'The supplied data is invalid.')
                .setThumbnail(spyBot.logos.warning)
                .setTimestamp()
                .setFooter({ text: 'Spy' });
        } else if (options.type === 'success') {
            embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Success.')
                .setDescription(options.message ?? 'Successfully executed the command.')
                .setThumbnail(spyBot.logos.checkmark)
                .setTimestamp()
                .setFooter({ text: 'Spy' });
        } else {
            embed = new EmbedBuilder()
                .setColor(Colors.Grey)
                .setTitle('Not found.')
                .setDescription(options.message ?? 'No elements have been found matching your request.')
                .setTimestamp()
                .setFooter({ text: 'Spy' });
        }

        if (options.fields) embed.setFields(...options.fields);
        if (options.image) embed.setImage(options.image);

        if (!(interaction.deferred || interaction.replied)) {
            return await interaction.reply({ embeds: [embed] });
        }

        if (options.followUp) {
            return await interaction.followUp({ embeds: [embed] });
        } else {
            return await interaction.editReply({ embeds: [embed] });
        }
    }
}

const spyBot = new spyBotObject();

export default spyBot;
export type spyBot = typeof spyBot;
