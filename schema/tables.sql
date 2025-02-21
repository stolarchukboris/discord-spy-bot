create table if not exists serverLogsChannelSetting (guildId varchar(20) primary key, settingValue varchar(20) unique not null);
create table if not exists starboardChannelSetting (guildId varchar(20) primary key, settingValue varchar(20) unique not null);
create table if not exists starboardReactionsMin (guildId varchar(20) primary key, settingValue tinyint unique not null);
create table if not exists starboardReactToOwnMsgs (guildId varchar(20) primary key, settingValue tinyint(1) unique not null);
create table if not exists eventAnnsChannelSetting (guildId varchar(20) primary key, settingValue varchar(20) unique not null);
create table if not exists eventUsersRolesSetting (guildId varchar(20) not null, settingValue varchar(20) unique not null);
create table if not exists eventPingRoleSetting (guildId varchar(20) primary key, settingValue varchar(20) unique not null);
create table if not exists modUsersRolesSetting (guildId varchar(20) not null, settingValue varchar(20) unique not null);
create table if not exists communityEvents (
	eventId varchar(36) primary key,
    guildId varchar(20) not null,
    eventHost varchar(20) not null,
    annsMessageId varchar(20) unique default null,
    eventGameUrl varchar(200) not null,
    eventGameName varchar(100) not null,
    gameThumbnailUrl varchar(200) not null,
    eventStatus tinyint not null default 1,
    eventTime varchar(20) unique not null
);
create table if not exists starboardMessages (
    originMessage varchar(20) primary key,
    starboardMessage varchar(20) unique not null,
    amountOfReactions tinyint not null
);