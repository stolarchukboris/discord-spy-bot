import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';

export default class welcomeCommand implements botCommand {
    name: Lowercase<string> = "welcome";
    description: string = "[ADMIN] Display the bot welcome message.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Hello!')
                    .setDescription(`:wave: Greetings,
Thank you for adding Spy bot to the ${interaction.guild.name} server.

Spy bot is a multipurpose application. It helps users easily retrieve information on Discord and Roblox users, servers/groups.
Spy bot also features a starboard system which lets users "pin" what they consider the best messages by reacting wih :star: on them!
The coolest Spy bot's feature is the community events system. The event organizers (whom you can define in settings) can easily manipulate the community events: schedule, start, update, and so on.

Please take a look at this bot's command list to see all Spy's features.
Most importantly, please see all of the Spy's settings using the </settings view:1326876939482566673> command. </settings alter:1326876939482566673> and </settings clear:1326876939482566673> commands may be used to set and delete Spy settings in this guild.

Have a great time using Spy!`)
            ]
        });
        return;
    }
}