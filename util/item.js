// use https://items.classicmaps.xyz/
//
// For example https://classic.wowhead.com/item=10399/blackened-defias-armor becomes https://items.classicmaps.xyz/17109.png.
const {reactionTagName} = require('../config.json');
const {items} = require('../items.json');
const Discord = require('discord.js')

function getImage(item) {
  return "https://items.classicmaps.xyz/" + item.wowheadID + ".png"
}

function getItem(searchQuery) {
  return items.find(q => q.name.toLowerCase().search(searchQuery.toLowerCase()) != -1);
}

module.exports = {
  get: getItem,
  image: getImage,
}