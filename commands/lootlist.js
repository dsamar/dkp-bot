const Discord = require('discord.js')
const {lootLogChannel, reactionTagName, raidTemplate} = require('../config.json');
const sanitize = require('../util/sanitize.js');
const loot = require('../util/loot.js');
const {table} = require('table')

function serialize(lootEntryList) {
  const data = lootEntryList.map((item) => {
    return item.itemName + ', ' + item.cost + ', ' + item.user;
  });
  return '```' + data.join('\n') + '```';
}

module.exports = {
	name: 'lootlist',
	description: 'lists all the loot dropped from a raid',
  args: true,
  usage: '<raidID>',
  officer: true,
  locks: [],
	execute(message, args) {
    // args[0] date-time
    const raidID = args[0];
		const channel = message.guild.channels.find(ch => ch.name === lootLogChannel);
    
    return loot.lootList(message.guild.id, raidID).then((list) => {
      const content = serialize(list);
      return channel.send(content);
    })
	},
};
