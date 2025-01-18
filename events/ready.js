import { Events, EmbedBuilder, WebhookClient, Colors } from 'discord.js';
import { eventReminder } from '../misc/function.js';
import logos from '../misc/logos.js';

const whUrl = process.env.WH_URL;
const guildId = process.env.GUILD_ID;

export const name = Events.ClientReady;
export const once = true;
export async function execute(client) {
	const webhookClient = new WebhookClient({ url: whUrl });

	console.log(`Ready! Logged in as ${client.user.tag}`);
	client.user.setPresence({ activities: [{ name: `on 47-AK's nerves` }], status: 'dnd' });

	const embed = new EmbedBuilder()
		.setTitle('Spy is now working.')
		.setColor(Colors.Green)
		.setDescription(`Websocket heartbeat: ${client.ws.ping} ms.`)
		.setThumbnail(logos.heart)
		.setTimestamp()
		.setFooter({ text: 'Spy' });

	webhookClient.send({
		embeds: [embed],
	});
	try {
		const guild = await client.guilds.cache.get(guildId);
		await guild.channels.cache.each(async (channel) => {
			if (channel.type === 0) {
				const fetchedChannel = await channel.fetch(channel.id);
				await fetchedChannel.messages.fetch();
			}
		});
	} catch (error) {
		console.error(error);
	}

	while (true) {
		await eventReminder(client);

		await new Promise(resolve => setTimeout(resolve, 1_000));
	};
}