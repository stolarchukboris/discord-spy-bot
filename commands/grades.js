const { ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('grades')
        .setDescription('Commands related to school grades.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('calculate_avg')
                .setDescription('Calculate or predict your average grade based on the current input.')
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const response = await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle('Grades calculator')
                    .setDescription('Use the buttons below to insert your grades into the calculator.\nRe-running the command will erase your input.')
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('five')
                            .setLabel('5')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('four')
                            .setLabel('4')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('three')
                            .setLabel('3')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('two')
                            .setLabel('2')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('clear')
                            .setLabel('C')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true)
                    )
            ]
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button });
        let grades = [];

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                await i.deferReply({ ephemeral: true });
                await i.update({ content: 'This is not for you.' });
                return;
            };

            if (i.component.label === 'C') {
                grades = [];
            };

            const grade = parseInt(i.component.label);
            grades.push(grade);

            if (grades.length > 0) {
                await i.update({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('five')
                                    .setLabel('5')
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId('four')
                                    .setLabel('4')
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId('three')
                                    .setLabel('3')
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId('two')
                                    .setLabel('2')
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId('clear')
                                    .setLabel('C')
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ]
                })
            };

            const avg = grades.reduce((a, b) => a + b) / grades.length;

            await i.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(i.message.embeds[0].hexColor)
                        .setTitle(i.message.embeds[0].title)
                        .setDescription(i.message.embeds[0].description)
                        .setFields(
                            { name: 'Input', value: `\`\`\`ini\n[ ${grades ?? 'Empty' } ]\n\`\`\``},
                            { name: 'Output', value: `\`\`\`ini\n[ ${avg ?? 'Empty' } ]\n\`\`\``}
                        )
                        .setTimestamp()
                        .setFooter(i.message.embeds[0].footer)
                ]
            });
        });
    },
};