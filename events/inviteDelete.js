const { Events, EmbedBuilder } = require('discord.js');
const mysql = require('@mysql/xdevapi');

const db_config = {
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    host: 'localhost',
    port: 33060,
    schema: process.env.DB_SCHEMA
}

module.exports = {
    name: Events.InviteDelete,
    async execute(invite) {
        await mysql.getSession(db_config)
            .then(async session => {
                await session.sql(`select settingValue from serverLogsChannelSetting where guildId = ${invite.guild.id};`).execute()
                    .then(async result => {
                        const logsChannelId = result.fetchOne()[0];

                        const embed = new EmbedBuilder()
                            .setColor(0xff7a7a)
                            .setTitle(`Invite has been deleted.`)
                            .setDescription(`Invite code: ${invite.code}\nInvite link: ${invite.url}`)
                            .setTimestamp()
                            .setFooter({ text: `Spy Moderation` });

                        const channel = invite.guild.channels.cache.get(logsChannelId);

                        await channel.send({ embeds: [embed] });

                        return await session.close();
                    })
                    .catch(async error => {
                        console.error(error);

                        return await session.close();
                    });
            })
            .catch(async error => {
                console.error(error);
            });
    }
}