// use https://items.classicmaps.xyz/
//
// For example https://classic.wowhead.com/item=10399/blackened-defias-armor becomes https://items.classicmaps.xyz/17109.png.
const {items, reactionTagName} = require('../config.json');
const Discord = require('discord.js')

function getImage(item) {
  return "https://items.classicmaps.xyz/" + item.wowheadID + ".png"
}

function getItem(searchQuery) {
  return items.find(q => q.name.toLowerCase().search(searchQuery.toLowerCase()) != -1);
}

function addReactions(message) {
  const bid = message.guild.emojis.find(em => em.name === 'bid');
  message.react(bid);
}

module.exports = {
  name: 'bidstart',
	description: 'todo',
  args: true,
  aliases: ['item'],
  officer: true,
  execute: function(message, args) {
    const itemQuery = args.join(" ");
    const content = new Discord.RichEmbed();
    const item = getItem(itemQuery);
    if (!item) {
      throw new Error("item not found: " + itemQuery);
    }
    content.setTitle("**" + item.name + "**");
    content.setImage(getImage(item));
    content.setDescription("");
    content.addField("cost", item.cost, false);
    
    content.addField(reactionTagName, "bidscreen", true);
    return message.channel.send(content)
      .then(bidMessage => {
        addReactions(bidMessage);
        const receivedEmbed = bidMessage.embeds[0];
        const newEmbed = new Discord.RichEmbed(receivedEmbed).setFooter("Bid ID: " + bidMessage.id);
        return bidMessage.edit("", newEmbed);
      });
  }
}