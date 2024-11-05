const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();
const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildModeration] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const mainFiles = fs.readdirSync(foldersPath);
const utilsFolder = path.join(foldersPath, 'utility');
const utils = fs.readdirSync(utilsFolder);

const commandFiles = mainFiles.filter(file => file.endsWith('.js'));
const utilCommandFiles = utils.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(foldersPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

for (const file of utilCommandFiles) {
	const filePath = path.join(utilsFolder, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);