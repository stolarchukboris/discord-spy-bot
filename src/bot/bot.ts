import { readdir, lstat } from "fs/promises";
import { spyBot } from '../index.js';
import { Client, Collection, IntentsBitField, REST, RESTPostAPIApplicationCommandsJSONBody, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { config } from 'dotenv';
import { botCommand, botEvent } from '../types/global.js';
const __dirname = import.meta.dirname;

config();

interface botEventObject {
    functions: botEvent[];
    read: () => Promise<botEvent[]>
    load: () => Promise<void>;
}

export default class Bot extends Client {
    REST: REST = new REST();
    apiCommands: SlashCommandBuilder[] = [];
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildInvites,
                IntentsBitField.Flags.GuildModeration,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.GuildVoiceStates
            ]
        });

        this.spyBot = spyBot;

        this.REST.setToken(this.spyBot.env.TOKEN);

        this.commands.push().then(() => {
            console.log('Commands pushed.');
            this.login(this.spyBot.env.TOKEN);
        });

        this.events.load().then(() => {
            console.log('Events loaded.');
        });
    }

    commands = {
        list: new Collection<string, Collection<string, botCommand>>(),

        read: async (): Promise<Collection<string, Collection<string, botCommand>>> => {
            const categoryDirs = await readdir(`${__dirname}/commands`);
            const commandList = new Collection<string, Collection<string, botCommand>>;

            for (const categoryDir of categoryDirs) {
                const category = new Collection<string, botCommand>();
                const commandFiles = await readdir(`${__dirname}/commands/${categoryDir}`);

                for (const commandFile of commandFiles) {
                    const commandFileStat = await lstat(`${__dirname}/commands/${categoryDir}/${commandFile}`);
                    const commandClass = (await import(`./commands/${categoryDir}/${commandFile}${commandFileStat.isDirectory() && '/index.js' || ''}`)).default;
                    const commandData: botCommand = new commandClass(this.spyBot);

                    if (commandFileStat.isDirectory()) {
                        if (!commandData.subcommands) {
                            commandData.subcommands = [];
                        }
                        commandData.isIndexer = true;
                    }
                    category.set(commandData.name, commandData);
                }
                commandList.set(categoryDir, category);
            }
            return commandList
        },

        push: async () => {
            const commandsList = await this.commands.read();
            this.commands.list = commandsList;

            const parsedGCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
            const parsedDCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

            for (const categoryName of commandsList.keys()) {
                const category = commandsList.get(categoryName);

                if (!category) {
                    console.error(`Category ${categoryName} is null!`)
                    continue;
                }

                for (const command of category.values()) {
                    const slashCommand = new SlashCommandBuilder();
                    slashCommand.setName(command.name);
                    slashCommand.setDescription(command.description);

                    for (const option of command.options || []) {
                        slashCommand.options.push(option);
                    }

                    if (command.isIndexer) {
                        const subCommandFiles = await readdir(`${__dirname}/commands/${categoryName}/${command.name}`);

                        for (const subCommandFile of subCommandFiles) {
                            if (subCommandFile.includes('index.')) continue;

                            const subCommandClass = (await import(`./commands/${categoryName}/${command.name}/${subCommandFile}`)).default;
                            const subCommandData: botCommand = new subCommandClass(this.spyBot);

                            const subCommand = new SlashCommandSubcommandBuilder();

                            subCommand.setName(subCommandData.name);
                            subCommand.setDescription(subCommandData.description);

                            for (const option of subCommandData.options || []) {
                                subCommand.options.push(option);
                            }

                            command.subcommands?.push(subCommandData);

                            slashCommand.addSubcommand(subCommand);
                        }
                    }

                    this.apiCommands.push(slashCommand);

                    if (command.developer) {
                        parsedDCommands.push(slashCommand.toJSON());
                    } else {
                        parsedGCommands.push(slashCommand.toJSON());
                    }
                }
            }

            await this.REST.put(
                Routes.applicationCommands(this.spyBot.env.CLIENT_ID),
                { body: parsedGCommands }
            );

            await this.REST.put(
                Routes.applicationGuildCommands(this.spyBot.env.CLIENT_ID, this.spyBot.env.GUILD_ID),
                { body: parsedDCommands }
            );
        }
    }

    events: botEventObject = {
        functions: [],

        read: async () => {
            const eventFiles = await readdir(`${__dirname}/events`);
            const events: botEvent[] = [];

            for (const eventFile of eventFiles) {
                const eventFunction = (await import(`./events/${eventFile}`)).default;

                events.push({
                    name: eventFile.replace(/\.[^/.]+$/, ""),
                    function: eventFunction.bind(null, this.spyBot)
                });
            }
            return events;
        },

        load: async () => {
            for (const event of Object.values(this.events.functions)) {
                this.removeAllListeners(event.name);
            }

            const events = await this.events.read();
            this.events.functions = events;

            for (const event of events) {
                this.on(event.name, event.function);
            }
        }
    }
}