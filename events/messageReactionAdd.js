const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(messageReaction, user, details) {
		//if (messageReaction.emoji.name === 'star' && messageReaction.count >= 1) {
        //    console.log('adding to stars');
        //}
        console.log(messageReaction.emoji.name);
	},
};