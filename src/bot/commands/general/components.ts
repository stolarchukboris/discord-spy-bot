import { botCommand } from "../../../types/global.js";
import { spyBot } from "../../../index.js";
import { ChatInputCommandInteraction, ContainerBuilder, ComponentType, MessageFlags, TextDisplayBuilder } from 'discord.js';

export default class componentCommand implements botCommand {
    name: Lowercase<string> = "components";
    description: string = "Components testing.";
    spyBot: spyBot;

    constructor(spyBot: spyBot) {
        this.spyBot = spyBot;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder({ content: 'hiiiii :3' }))
            ]
        });
    }
}
