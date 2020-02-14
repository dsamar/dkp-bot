const Discord = require('discord.js')
const sanitize = require('../util/sanitize.js');
const dkp = require('../util/dkp.js');
const tableview = require('../util/tableview.js');
const {items} = require('../items.json');
const item = require('../util/item.js');
const { officerRole } = require("../config.json");


function getItem(searchQuery) {
  return items.find(q => q.name.toLowerCase().search(searchQuery.toLowerCase()) != -1);
}

function getField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  return field;
}

function getOrAddField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  if (!field) {
    message.addField(fieldName, '``````');
    field = message.fields.find(field => field.name === fieldName);
  };
  return field;
}

module.exports = {
  name: 'bidscreen',
  locks: ['dkp'],
  execute: function(reaction, user) {
    let isOfficer = 
      reaction.message.guild.member(user).roles.some(role => role.name === officerRole);
    const dkpUsername = sanitize.name(user.username);
    return item.bidReact(reaction.message, dkpUsername, reaction.emoji.name, isOfficer);
  }
}