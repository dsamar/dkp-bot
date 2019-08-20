// use https://items.classicmaps.xyz/
//
// For example https://classic.wowhead.com/item=10399/blackened-defias-armor becomes https://items.classicmaps.xyz/17109.png.
const config = require('./config.json');
const Discord = require('discord.js')
const errors = require('./errors');
const emoji = require('./emoji');

function getImage(item) {
  return "https://items.classicmaps.xyz/" + item.wowheadID + ".png"
}

function getItem(ctx, searchQuery) {
  const item = config.items.find(q => q.name.search(searchQuery) != -1);
  if (!item) {
    errors.reply(ctx, "Can't find item: " + searchQuery);
  }
  return item;
}

function addReactions(message) {
  message.react(emoji.get(message.guild, 'bid')).then();
}

module.exports = {
  startBids: function(ctx, itemQuery, channel) {
    const embed = new Discord.RichEmbed();
    const item = getItem(ctx, itemQuery);
    embed.setTitle("Starting Bids");
    embed.setImage(getImage(item));
    embed.setFooter("DKP Cost: " + item.cost);
    channel.send(embed)
      .then(bidMessage => {
        addReactions(bidMessage);
      });
  }
}