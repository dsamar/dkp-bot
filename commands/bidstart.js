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

function addReactions(message, cost) {
  const bid = message.guild.emojis.find(em => em.name === 'bid');
  const dice = message.guild.emojis.find(em => em.name === 'dice');
  const cancel = message.guild.emojis.find(em => em.name === 'cancel');
  const refresh = message.guild.emojis.find(em => em.name === 'refresh');
  const winner = message.guild.emojis.find(em => em.name === 'winner');
  return message.react(bid)
    .then(() => {
      if (cost == 0) {
        return message.react(dice)
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      return message.react(cancel)
    })
    .then(() => {
      return message.react(refresh);
    })
    .then(() => {
      return message.react(winner);
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
    // content.setImage(item.getWowheadLink(itemObj));
    content.setDescription(item.getWowheadLink(itemObj));
    content.addField("cost", itemObj.cost, false);
    if (itemObj.notes) {
      content.addField("notes", itemObj.notes, false);
    }
    if (itemObj.tags.includes("t2")) {
      content.addField("type", "t2", false);
    }
    if (itemObj.tags.includes("t3")) {
      content.addField("type", "t3", false);
    }
    if (itemObj.tags.includes("t2.5")) {
      content.addField("type", "t2.5", false);
    }
    
    content.addField(reactionTagName, "bidscreen", true);
    return message.channel.send(content)
      .then(bidMessage => {
        const receivedEmbed = bidMessage.embeds[0];
        const newEmbed = new Discord.RichEmbed(receivedEmbed).setFooter("Bid ID: " + bidMessage.id);
        return bidMessage.edit(bidMessage.content, newEmbed);
      })
      .then(bidMessage => {
        return addReactions(bidMessage, itemObj.cost);
      });
  }
}