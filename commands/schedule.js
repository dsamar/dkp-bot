const Discord = require('discord.js')
const {raidAnnounceChannel, reactionTagName, raidTemplate} = require('../config.json');
const sanitize = require('../util/sanitize.js');

function addRaidSignups (message) {
  // Add other classes/specs
  const bid = message.guild.emojis.find(em => em.name === 'bid');
  const cancel = message.guild.emojis.find(em => em.name === 'cancel');
  return message.react(bid)
    .then(() => {
      return message.react(cancel)
    });
}

module.exports = {
	name: 'schedule',
	description: 'todo',
  args: true,
  aliases: ['raid', 'scheduleraid', 'makeraid', 'createraid', 'raidschedule'],
  officer: true,
  locks: [],
	execute(message, args) {
    // args[0] date-time
    const datetime = args.join(" ");
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
        const receivedEmbed = raidMessage.embeds[0];
        const newEmbed = new Discord.RichEmbed(receivedEmbed).setFooter("Raid ID: " + raidMessage.id);
        const promise1 = message.channel.send("created raid: " + sanitize.makeMessageLink(raidMessage));
        const promise2 = raidMessage.edit("", newEmbed);
        return Promise.all([promise1, promise2]).then(() => {
          return addRaidSignups(raidMessage);
        });
      });
	},
};
