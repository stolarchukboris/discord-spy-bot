import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandStringOption } from 'discord.js';
import logos from '../../../../misc/logos.js';
import settingsEnum from "../../../../misc/settingsEnum.js";

export default class settingsCommand implements botCommand {
    name: Lowercase<string> = "clear";
    description: string = "[ADMIN] Clear a certain bot setting in this guild.";
    spyBot: spyBot;
    admin = true;
    options = [
        new SlashCommandStringOption()
            .setName('setting')
            .setDescription('The name of the setting to be cleared.')
            .setChoices(settingsEnum)
            .setRequired(true),
        new SlashCommandStringOption()
            .setName('value')
            .setDescription('The value of the setting to be cleared. Ignore to clear all setting\'s values.')
    ]

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const knex = this.spyBot.knex;
        const setting = interaction.options.getString('setting', true);
        const value = interaction.options.getString('value');
        let desc;

        if (!value) {
            await knex(setting)
                .del()
                .where('guildId', interaction.guild.id);

            desc = `Setting \`${setting}\` has been successfully cleared.`;
        } else {
            await knex(setting)
                .del()
                .where('guildId', interaction.guild.id)
                .andWhere('settingValue', value);

            desc = `Value \`${value}\` of a setting \`${setting}\` has been successfully cleared.`;
        }

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(desc)
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy Configuration' })
            ]
        });
        return;
    }
}