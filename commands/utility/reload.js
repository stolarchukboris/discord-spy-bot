const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reload bot components.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('command')
				.setDescription('Reload a single bot command.')
				.addStringOption(option =>
					option.setName('command')
						.setDescription('The command to reload.')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('cmds')
				.setDescription('Reload ALL bot commands.')
		),

	async execute(interaction) {
		await interaction.deferReply();
		const ownerId = process.env.OWNER_ID;

		if (interaction.user.id === ownerId) {
			if (interaction.options.getSubcommand() === 'command') {
				const commandName = interaction.options.getString('command', true).toLowerCase();
				const command = interaction.client.commands.get(commandName);

				const mbedSuccess = new EmbedBuilder()
					.setColor(Colors.Green)
					.setTitle(`Reload successful.`)
					.setDescription(`Successfully reloaded a command "/${command.data.name}".`)
					.setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
					.setTimestamp()
					.setFooter({ text: 'Spy' });

				if (!command) {
					const mbed = new EmbedBuilder()
						.setColor(Colors.Red)
						.setTitle(`Reload error.`)
						.setDescription(`There is no command with name "/${commandName}".`)
						.setTimestamp()
						.setFooter({ text: 'Spy' });

					return await interaction.editReply({ embeds: [mbed] });
				}

				try {
					delete require.cache[require.resolve(`./${command.data.name}.js`)];

					try {
						const newCommand = require(`./${command.data.name}.js`);
						await interaction.client.commands.set(newCommand.data.name, newCommand);

						return await interaction.editReply({ embeds: [mbedSuccess] });
					} catch (error) {
						console.error(error);
						return await interaction.editReply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
					}
				} catch {
					delete require.cache[require.resolve(`../${command.data.name}.js`)];

					try {
						const newCommand = require(`../${command.data.name}.js`);
						await interaction.client.commands.set(newCommand.data.name, newCommand);

						return await interaction.editReply({ embeds: [mbedSuccess] });
					} catch (error) {
						console.error(error);
						return await interaction.editReply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
					}
				}
			} else if (interaction.options.getSubcommand() === 'cmds') {
				const commands = [];
				// Grab all the command folders from the commands directory you created earlier
				const foldersPath = 'D:/Program Files/discord_stuff/discord-spy-bot/commands';
				const mainFiles = fs.readdirSync(foldersPath);
				const utilsFolder = path.join(foldersPath, 'utility');
				const utils = fs.readdirSync(utilsFolder);

				const commandFiles = mainFiles.filter(file => file.endsWith('.js'));
				const utilCommandFiles = utils.filter(file => file.endsWith('.js'));

				for (const file of commandFiles) {
					const filePath = path.join(foldersPath, file);
					const command = require(filePath);

					delete require.cache[require.resolve(`../${command.data.name}.js`)];

					try {
						const newCommand = require(`../${command.data.name}.js`);
						await interaction.client.commands.set(newCommand.data.name, newCommand);
					} catch (error) {
						console.error(error);
						return await interaction.editReply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
					}
				}

				for (const file of utilCommandFiles) {
					const filePath = path.join(utilsFolder, file);
					const command = require(filePath);

					delete require.cache[require.resolve(`./${command.data.name}.js`)];

					try {
						const newCommand = require(`./${command.data.name}.js`);
						await interaction.client.commands.set(newCommand.data.name, newCommand);
					} catch (error) {
						console.error(error);
						return await interaction.editReply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
					}
				}
				const mbed = new EmbedBuilder()
					.setColor(Colors.Green)
					.setTitle('Commands reloaded.')
					.setDescription('All bot commands have been successfully reloaded.')
					.setThumbnail('https://septik-komffort.ru/wp-content/uploads/2020/11/galochka_zel.png')
					.setTimestamp()
					.setFooter({ text: 'Spy' });

				return await interaction.editReply({ embeds: [mbed] });
			}
		} else {
			const mbed = new EmbedBuilder()
				.setColor(Colors.Red)
				.setTitle(`Error.`)
				.setDescription(`You are not authorized to run this command.`)
				.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Noto_Emoji_Oreo_2757.svg/1200px-Noto_Emoji_Oreo_2757.svg.png')
				.setTimestamp()
				.setFooter({ text: 'Spy' });

			return await interaction.editReply({ embeds: [mbed] });
		}
	},
};