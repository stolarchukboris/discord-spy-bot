import { botCommand } from "../../../../types/global.js";
import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandStringOption } from 'discord.js';
import logos from '../../../../misc/logos.js';
import settingsEnum from "../../../../misc/settingsEnum.js";

export default class settingsCommand implements botCommand {
    name: Lowercase<string> = "alter";
    description: string = "[ADMIN] Alter a certain bot setting in this guild.";
    spyBot: spyBot;
    admin = true;
    options = [
        new SlashCommandStringOption()
            .setName('setting')
            .setDescription('The name of the setting to be altered.')
            .setChoices(settingsEnum)
            .setRequired(true),
        new SlashCommandStringOption()
            .setName('value')
            .setDescription('The value of this setting.')
            .setRequired(true)
    ]

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        const knex = this.spyBot.knex;
        const setting = interaction.options.getString('setting', true);
        const settingValue = interaction.options.getString('value', true);

        await knex.raw(
            `insert into ${setting} values (?, ?) on duplicate key update settingValue = ?`,
            [interaction.guild.id, settingValue, settingValue]
        );

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Setting \`${setting}\` has been successfully set to \`${settingValue}\`.`)
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy Configuration' })
            ]
        });
        return;
    }
}