const Discord = require('discord.js')
const {raidAnnounceChannel, reactionTagName, raidTemplate} = require('../config.json');
const sanitize = require('../util/sanitize.js');

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
  aliases: ['create', 'raid', 'schedule', 'makeraid', 'createraid', 'raidschedule'],
	execute(message, args) {
    // args[0] date
    const datetime = args[0];
		const channel = message.guild.channels.find(ch => ch.name === raidAnnounceChannel);
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
        const ref = sanitize.makeMessageLink(raidMessage);
        const promise1 = message.reply("created raid: " + ref);
        const promise2 = raidMessage.edit("", newEmbed);
        return Promise.all([promise1, promise2]);
      });
	},
};
