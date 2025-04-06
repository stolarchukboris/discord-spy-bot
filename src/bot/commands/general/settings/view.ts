import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, ColorResolvable } from 'discord.js';

export default class settingsCommand implements botCommand {
    name: Lowercase<string> = "view";
    description: string = "[ADMIN] View the current bot configuration in this server.";
    spyBot: spyBot;
    admin = true;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const knex = this.spyBot.knex;
        const setup: string[] = [];
        const notSetup: string[] = [];

        for (const setting of this.spyBot.settings) {
            const result = await knex<settingInfo>(setting.value)
                .select('*')
                .where('guildId', interaction.guild.id);

            if (!result || result.length === 0) {
                notSetup.push(setting.name);
            } else {
                setup.push(setting.name);
            }
        }

        let setupField = ``;
        let notSetupField = ``;
        let color: ColorResolvable;
        let desc;

        color = Colors.Yellow;

        if (setup.length === 0) {
            setupField = 'None.';
            desc = 'Bot has not been set up yet. Only basic functionality is available.';
        } else {
            for (const setting of setup) {
                setupField = setupField.concat(`- ${setting}\n`);
            }
        }

        if (notSetup.length === 0) {
            notSetupField = 'None.';
            color = Colors.Green;
            desc = 'Bot is all set.';
        } else {
            for (const setting of notSetup) {
                notSetupField = notSetupField.concat(`- ${setting}\n`);
            }
        }

        if (setup.length > 0 && notSetup.length > 0) {
            desc = 'Some bot modules have not been set up yet.';
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(color)
                    .setTitle('Configuration Info')
                    .setDescription(desc as string)
                    .setFields(
                        { name: 'Set up', value: setupField, inline: true },
                        { name: 'Not set up', value: notSetupField, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });
    }
}
