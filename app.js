import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import knex from 'knex';
const __dirname = import.meta.dirname;

config();
const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages] });

client.commands = new Collection();
const foldersPath = join(__dirname, 'commands');
const mainFiles = readdirSync(foldersPath);
const utilsFolder = join(foldersPath, 'utility');
const utils = readdirSync(utilsFolder);

const commandFiles = mainFiles.filter(file => file.endsWith('.js'));
const utilCommandFiles = utils.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = join(foldersPath, file);
	const command = (await import(`file://${filePath}`));;
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	};
};

for (const file of utilCommandFiles) {
	const filePath = join(utilsFolder, file);
	const command = (await import(`file://${filePath}`));;
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	};
};

const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = join(eventsPath, file);
	const event = (await import(`file://${filePath}`));;
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	};
};

client.knex = knex({
	client: 'mysql2',
	connection: {
		host: '127.0.0.1',
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_SCHEMA
	}
});

client.login(token);