const Discord = require('discord.js')
const sanitize = require('../util/sanitize.js');
const dkp = require('../util/dkp.js');
const tableview = require('../util/tableview.js');
const {items} = require('../items.json');
const item = require('../util/item.js');
const { officerRole } = require("../config.json");

module.exports = {
  name: 'bidscreen',
  locks: ['dkp'],
  execute: function(reaction, user) {
    let isOfficer = 
      reaction.message.guild.member(user).roles.some(role => role.name === officerRole);
    const dkpUsername = sanitize.getNickname(user, reaction.message.guild);
    return item.bidReact(reaction.message, dkpUsername, reaction.emoji.name, isOfficer);
  }
}