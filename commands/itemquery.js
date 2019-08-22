const Discord = require('discord.js')
const config = require('../config.json');
const item = require('../util/item.js');

module.exports = {
	name: 'itemquery',
	description: 'Lists all the cost of a particular item.',
  args: true,
  usage: '',
  officer: false,
  locks: [],
  aliases: ['query'],
	execute(message, args) {
    const query = args.join(" ");
    const itemObj = item.get(query);
    if (!itemObj) {
      throw new Error("item not found: " + query);
    }
    const content = new Discord.RichEmbed();
    content.setTitle("**" + itemObj.name + "**");
    content.setImage(item.image(itemObj));
    content.addField("cost", itemObj.cost, false);
    return message.author.send(content);
  }
};
