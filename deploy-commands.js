import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
const __dirname = import.meta.dirname;

config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const commands = [];
const devCommands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = join(__dirname, 'commands');
const mainFiles = readdirSync(foldersPath);
const utilsFolder = join(foldersPath, 'utility');
const utils = readdirSync(utilsFolder);

const commandFiles = mainFiles.filter(file => file.endsWith('.js'));
const utilCommandFiles = utils.filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const filePath = join(foldersPath, file);
	const command = (await import(`file://${filePath}`));
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	};
};

for (const file of utilCommandFiles) {
	const filePath = join(utilsFolder, file);
	const command = (await import (`file://${filePath}`));
	if ('data' in command && 'execute' in command) {
		devCommands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	};
};

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		/*console.log(`Deleting developer application commands...`);

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: [] }
		);

		console.log(`Success.`);

		await new Promise(resolve => setTimeout(resolve, 1_000));

		console.log(`Deleting global application commands...`);

		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: [] }
		);

		console.log(`Success.`);

		await new Promise(resolve => setTimeout(resolve, 1_000));*/

		console.log(`Refreshing ${devCommands.length} developer application (/) commands.`);

		let data;

		data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: devCommands }
		);

		console.log(`Successfully refreshed ${data.length} commands.`);

		await new Promise(resolve => setTimeout(resolve, 1_000));

		console.log(`Refreshing ${commands.length} global application commands...`);

		data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands }
		);

		console.log(`Successfully refreshed ${data.length} commands. Please reboot the bot.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	};
})();