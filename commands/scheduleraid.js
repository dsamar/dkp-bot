const Discord = require('discord.js')
const {channelName, reactionTagName, raidTemplate} = require('../config.json');

function addRaidSignups (message) {
  // Add other classes/specs
  const mage = message.guild.emojis.find(em => em.name === 'mage');
  const cancel = message.guild.emojis.find(em => em.name === 'cancel');
  message.react(mage)
    .then(() => message.react(cancel));
}

module.exports = {
	name: 'scheduleraid',
	description: 'todo',
  args: true,
  aliases: ['raid'],
	execute(message, args) {
    const datetime = args[0];
		const channel = message.guild.channels.find(ch => ch.name === channelName);
    const content = new Discord.RichEmbed();
    content.setTitle(raidTemplate.title);
    content.setDescription(raidTemplate.description);
    content.addField("date-time", datetime);
    content.addField("signup-list", "<empty>");
    content.addField("total-players", 0);
    content.addField(reactionTagName, "raidsignup", true);
    return channel.send(content)
      .then(raidMessage => {
        addRaidSignups(raidMessage)
        const receivedEmbed = raidMessage.embeds[0];
        const newEmbed = new Discord.RichEmbed(receivedEmbed).setFooter("Raid ID: " + raidMessage.id);
        return raidMessage.edit("", newEmbed);
      });
	},
};
