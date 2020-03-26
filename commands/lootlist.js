const Discord = require('discord.js')
const {lootLogChannel, reactionTagName, raidTemplate} = require('../config.json');
const sanitize = require('../util/sanitize.js');
const loot = require('../util/loot.js');
const {table} = require('table')

const MESSAGE_LIMIT = 1900;


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
      const data = list.map((item) => {
        return item.itemName + ', ' + item.cost + ', ' + item.user;
      });
      let serialized = data.join('\n');
      let serializedLines = serialized.split("\n");
      const numMessages = Math.ceil(serialized.length / MESSAGE_LIMIT);
      const chunkSize = Math.floor(serializedLines.length / numMessages);
      const promiseList = [];
      for (let i = 0; i < numMessages; i++) {
        let currentContent = "";
        if (i != numMessages - 1) {
          currentContent =
            "```" +
            serializedLines.slice(i * chunkSize, (i + 1) * chunkSize).join("\n") +
            "```";
        } else {
          currentContent =
            "```" + serializedLines.slice(i * chunkSize).join("\n") + "```";
        }
          promiseList.push(channel.send(currentContent));
      }
      return Promise.all(promiseList);
    })
	},
};
