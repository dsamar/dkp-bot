const Discord = require('discord.js')
const {raidAnnounceChannel, reactionTagName, raidTemplate} = require('../config.json');
const sanitize = require('../util/sanitize.js');

function addRaidSignups (message) {
  // Add the classes
  const warrior = message.react(message.guild.emojis.find(em => em.name === 'warrior'));
  const priest = message.react(message.guild.emojis.find(em => em.name === 'priest'));
  const shaman = message.react(message.guild.emojis.find(em => em.name === 'shaman'));
  const druid = message.react(message.guild.emojis.find(em => em.name === 'druid'));
  const rogue = message.react(message.guild.emojis.find(em => em.name === 'rogue'));
  const hunter = message.react(message.guild.emojis.find(em => em.name === 'hunter'));
  const mage = message.react(message.guild.emojis.find(em => em.name === 'mage'));
  const warlock = message.react(message.guild.emojis.find(em => em.name === 'warlock'));
  const paladin = message.react(message.guild.emojis.find(em => em.name === 'paladin'));
  
  const cancel = message.guild.emojis.find(em => em.name === 'cancel');
  return Promise.all([warrior, priest, shaman, druid, rogue, hunter, warlock, paladin]).then(() => message.react(cancel));
}

module.exports = {
	name: 'schedule',
	description: 'makes a new raid entry, allows anyone to sign up',
  args: false,
  usage: '[date or time]',
  aliases: ['raid', 'scheduleraid', 'makeraid', 'createraid', 'raidschedule'],
  officer: true,
  locks: [],
	execute(message, args) {
    // args[0] date-time
    const userInput = args.join(" ");
		const channel = message.guild.channels.find(ch => ch.name === raidAnnounceChannel);
    const content = new Discord.RichEmbed();
    content.setTitle(raidTemplate.title);
    content.setDescription(raidTemplate.description);
    content.addField("details", userInput);
    content.addField("total-players", 0);
    content.addField(reactionTagName, "raidsignup");
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
