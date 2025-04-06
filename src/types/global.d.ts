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

/**
 * Embed types.
 * 
 * @param accessDenied Embed for rejecting unauthorized command access.
 * @param error Embed that represents errors.
 * @param warning Embed that represents input warnings or notifications.
 * @param success Embed that represents a successful command execution.
 * @param notFound Embed that represents an unsuccessful search query.
*/
type embedType = 'accessDenied' | 'error' | 'warning' | 'success' | 'notFound';

/**
 * Premade embed options.
 * 
 * @readonly
 * @param {embedType} type The {@link embedType | type} of embed to use.
 * @param {boolean} followUp (optional, defaults to `false`) If the interaction if deferred, whether to edit a reply or to send a follow up to it.
 * @param {string} message (optional, the default message depends on the embed type) A message to be displayed in the embed description.
 * @param {RestOrArray<APIEmbedField>} fields (optional) Fields to be attached to the embed.
 * @param {string} image (optional) An image to be attached to the embed.
 */
export interface premadeEmbedOptions {
    readonly type: embedType;
    readonly followUp?: boolean;
    readonly message?: string;
    readonly fields?: RestOrArray<APIEmbedField>;
    readonly image?: string;
}
