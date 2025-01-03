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
	}
}

for (const file of utilCommandFiles) {
	const filePath = join(utilsFolder, file);
	const command = (await import (`file://${filePath}`));
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();