declare type eventInfo = {
    eventId: string;
    guildId: string;
    eventHost: string;
    annsMessageId: string;
    eventGameUrl: string;
    eventGameName: string;
    gameThumbnailUrl: string;
    eventStatus: number;
    eventTime: number;
    reminded: boolean;
}

declare type settingInfo = {
    guildId: string;
    settingValue: string | number | boolean;
}

declare type starboardMessage = {
    originMessage: string;
    starboardMessage: string;
    amountOfReactions: number;
}