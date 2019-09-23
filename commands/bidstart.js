// use https://items.classicmaps.xyz/
//
// For example https://classic.wowhead.com/item=10399/blackened-defias-armor becomes https://items.classicmaps.xyz/17109.png.
const Discord = require('discord.js')
const {reactionTagName} = require('../config.json');
const {items} = require('../items.json');
const item = require('../util/item.js');


function getItem(searchQuery) {
  return items.find(q => q.name.toLowerCase().search(searchQuery.toLowerCase()) != -1);
}

function addReactions(message) {
  const bid = message.guild.emojis.find(em => em.name === 'bid');
  const cancel = message.guild.emojis.find(em => em.name === 'cancel');
  const refresh = message.guild.emojis.find(em => em.name === 'refresh');
  return message.react(bid)
    .then(() => {
      return message.react(cancel)
    })
    .then(() => {
      return message.react(refresh);
    });
}

module.exports = {
  name: 'bidstart',
	description: 'starts bidding on an item, displays the item bid screen',
  usage: '<query>',
  args: true,
  aliases: ['item'],
  officer: true,
  locks: [],
  execute: function(message, args) {
    const itemQuery = args.join(" ");
    const content = new Discord.RichEmbed();
    const itemObj = item.get(itemQuery);
    if (!itemObj) {
      throw new Error("item not found: " + itemQuery);
    }
    content.setTitle("**" + itemObj.name + "**");
    content.setImage(item.image(itemObj));
    content.setDescription("");
    content.addField("cost", itemObj.cost, false);
    if (itemObj.notes) {
      content.addField("notes", itemObj.notes, false);
    }
    
    content.addField(reactionTagName, "bidscreen", true);
    return message.channel.send(content)
      .then(bidMessage => {
        const receivedEmbed = bidMessage.embeds[0];
        const newEmbed = new Discord.RichEmbed(receivedEmbed).setFooter("Bid ID: " + bidMessage.id);
        return bidMessage.edit("", newEmbed).then(() => {
          return addReactions(bidMessage);
        });
      });
  }
}