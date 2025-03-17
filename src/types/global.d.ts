import { ApplicationCommandOptionBase, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

declare interface botCommand {
    name: Lowercase<string>;
    description: string;
    subcommands?: botCommand[];
    options?: ApplicationCommandOptionBase[];
    developer?: boolean;
    admin?: boolean;
    eo?: boolean;
    vc?: boolean;

    isIndexer?: boolean;
    spyBot: spyBot;

    execute(interaction: ChatInputCommandInteraction, ...args): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

declare interface botEvent {
    name: string,
    function: () => Promise<void>
}