import { spyBot } from "../../../../index.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, GuildChannel, SlashCommandStringOption } from "discord.js";
import { botCommand } from "../../../../types/global.js";
import logos from '../../../../misc/logos.js';

export default class eventsCommand implements botCommand {
    name: Lowercase<string> = "cancel";
    description: string = "[EO+] Cancel a community event in this server.";
    spyBot: spyBot;
    eo = true;
    options = [
        new SlashCommandStringOption()
            .setName('event_id')
            .setDescription('ID of the event to be cancelled.')
            .setRequired(true),
        new SlashCommandStringOption()
            .setName('reason')
            .setDescription('The reason for the event cancellation.')
            .setRequired(true)
    ]

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply();

        async function eventCheck(spyBot: spyBot, eventId: string, status = 0) {
            const event = await spyBot.knex('communityEvents')
                .select('*')
                .where('eventId', eventId)
                .andWhere('guildId', interaction.guild.id)
                .first();

            if (!event) {
                errorEmbed.setDescription(`Event with ID \`${eventId}\` has not been found in the database.`);

                return await interaction.followUp({ embeds: [errorEmbed] });
            }

            if (event.eventStatus === status) {
                switch (status) {
                    case 1:
                        errorEmbed.setDescription('This event has not been started yet.')

                        break;
                    case 2:
                        errorEmbed.setDescription('This event has already been concluded.')

                        break;
                }

                return await interaction.followUp({ embeds: [errorEmbed] });
            }

            return event;
        }

        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Error.')
            .setThumbnail(logos.warning)
            .setTimestamp()
            .setFooter({ text: 'Spy' });
        const channelSetting = await this.spyBot.knex('eventAnnsChannelSetting')
            .select('*')
            .where('guildId', interaction.guild.id)
            .first();
        const roleSetting = await this.spyBot.knex('eventPingRoleSetting')
            .select('*')
            .where('guildId', interaction.guild.id)
            .first();

        if (!channelSetting) {
            errorEmbed.setDescription(`Event announcements channel setting not configured.`);

            await interaction.followUp({ embeds: [errorEmbed] });
            return;
        };

        if (!roleSetting) {
            errorEmbed.setDescription(`Event ping role not configured.`)

            await interaction.followUp({ embeds: [errorEmbed] });
            return;
        };

        const role = roleSetting.settingValue;
        const channel = interaction.client.channels.cache.get(channelSetting.settingValue) as GuildChannel;
        if (!channel.isTextBased()) return;

        const eventId = interaction.options.getString('event_id', true);
        const reason = interaction.options.getString('reason', true);
        const event = await eventCheck(this.spyBot, eventId);

        await this.spyBot.knex('communityEvents')
            .del()
            .where('eventId', eventId);

        const gameName = event.eventGameName;
        const gameThumbnail = event.gameThumbnailUrl;
        const annsMessage = await channel.messages.cache.get(event.annsMessageId);
        if (!annsMessage) return;

        await annsMessage.reply({
            content: `<@&${role}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`The scheduled event has been cancelled.`)
                    .setDescription(`The scheduled event in ${gameName} has been cancelled.\n\nSorry for the inconvenience!`)
                    .setFields({ name: 'Reason', value: `${reason}` })
                    .setThumbnail(gameThumbnail)
                    .setTimestamp()
                    .setFooter({ text: `Spy` })
            ]
        });

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('The scheduled event has been cancelled and deleted successfully.')
                    .setThumbnail(logos.checkmark)
                    .setTimestamp()
                    .setFooter({ text: 'Spy' })
            ]
        });

        return;
    }
}
