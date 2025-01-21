import { ApplicationCommandOptionBase, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

declare interface botCommand {
    name: Lowercase<string>;
    description: string;
    subcommands?: botCommand[];
    options?: ApplicationCommandOptionBase[];
    developer?: boolean;
    admin?: boolean;
    eo?: boolean;

    isIndexer?: boolean;
    spyBot: spyBot;

    execute(interaction: ChatInputCommandInteraction): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

declare interface botEvent {
    name: string,
    function: () => Promise<void>
}