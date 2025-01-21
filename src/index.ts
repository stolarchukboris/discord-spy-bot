import { config } from 'dotenv';
import knex, { Knex } from 'knex';
import Bot from './bot/bot.js';

export enum botState {
    OFF, START, ON, STOP
}

class spyBotObject {
    state: botState = botState.OFF;
    env = config().parsed || {};
    knex: Knex;
    bot: Bot;

    constructor () {
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
}

const spyBot = new spyBotObject();

export default spyBot;
export type spyBot = typeof spyBot;