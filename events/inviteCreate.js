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
    name: Events.InviteCreate,
    async execute(invite) {
        await mysql.getSession(db_config)
            .then(async session => {
                await session.sql(`select settingValue from serverLogsChannelSetting where guildId = ${invite.guild.id};`).execute()
                    .then(async result => {
                        const logsChannelId = result.fetchOne()[0];

                        let inviteExp = Math.round(invite.expiresTimestamp / 1000);

                        if (inviteExp > Math.round(invite.createdTimestamp / 1000)) { inviteExp = `<t:${inviteExp}:f>` }
                        else { inviteExp = `Doesn't expire` }

                        const embed = new EmbedBuilder()
                            .setColor(0x2B2D31)
                            .setTitle(`A new invite link has been generated!`)
                            .setDescription(`Inviter: <@${invite.inviter.id}>\nCreated: <t:${Math.round(invite.createdTimestamp / 1000)}:f>\nExpires: ${inviteExp}\nInvite code: ${invite.code}\nInvite link: ${invite.url}`)
                            .setTimestamp()
                            .setFooter({ text: `Spy Moderation` });

                        const channel = invite.guild.channels.cache.get(logsChannelId);

                        await channel.send({ embeds: [embed] });
                    })
                    .catch(async error => {
                        console.error(error);

                        return await session.close();
                    });
            })
            .catch(async error => {
                console.error(error);
            });
    },
};