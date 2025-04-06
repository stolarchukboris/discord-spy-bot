import { Guild, Invite, EmbedBuilder, User, Colors, TextChannel } from "discord.js";
import spyBot from "../../index.js";

export default async (invite: Invite) => {
    try {
        const knex = spyBot.knex;
        const setting = await knex<settingInfo>('serverLogsChannelSetting')
            .select('*')
            .where('guildId', (invite.guild as Guild).id)
            .first();

        if (!setting) return;

        const logsChannelId = setting.settingValue as string;
        let inviteExp: string | number;
        inviteExp = Math.round(invite.expiresTimestamp as number / 1000);

        if (inviteExp > Math.round(invite.createdTimestamp as number / 1000)) { inviteExp = `<t:${inviteExp}:f>`; }
        else { inviteExp = `Doesn't expire.` };

        const channel = (invite.guild as Guild).channels.cache.get(logsChannelId) as TextChannel;
        if (!channel.isTextBased()) return;

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.LuminousVividPink)
                    .setTitle(`A new invite link has been generated.`)
                    .setDescription(`Inviter: ${invite.inviter as User}\nCreated: <t:${Math.round(invite.createdTimestamp as number / 1000)}:f>\nExpires: ${inviteExp}\nInvite code: ${invite.code}\nInvite link: ${invite.url}`)
                    .setTimestamp()
                    .setFooter({ text: `Spy Moderation` })
            ]
        });
    } catch (error) {
        console.error(error);
    }
}
