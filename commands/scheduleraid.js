const Discord = require('discord.js')
const {channelName, reactionTagName} = require('../config.json');

function addRaidSignups (message) {
  const mage = message.guild.emojis.find(em => em.name === 'mage');
  message.react(mage);
}

module.exports = {
	name: 'scheduleraid',
	description: 'todo',
  args: false,
	execute(message, args) {
		const channel = message.guild.channels.find(ch => ch.name === channelName);
    const content = new Discord.RichEmbed();
    content.setTitle("Raid");
    content.addField(reactionTagName, "raidsignup", true);
    channel.send(content)
      .then(raidMessage => {
      addRaidSignups(raidMessage)
      content.setFooter("RaidID: " + raidMessage.id);
      raidMessage.edit(content);
    });
	},
};
