declare type eventInfo = {
    readonly eventId: string;
    readonly guildId: string;
    readonly eventHost: string;
    readonly annsMessageId: string;
    readonly eventGameUrl: string;
    readonly eventGameName: string;
    readonly gameThumbnailUrl: string;
    readonly eventStatus: number;
    readonly eventTime: number;
    readonly reminded: boolean;
}

declare type settingInfo = {
    readonly guildId: string;
    readonly settingValue: string | number | boolean;
}

declare type starboardMessage = {
    readonly originMessage: string;
    readonly starboardMessage: string;
    readonly amountOfReactions: number;
}
