const Discord = require('discord.js')
const sanitize = require('../util/sanitize.js');
const dkp = require('../util/dkp.js');
const tableview = require('../util/tableview.js');

function addUser(description, user) {
  let lines = [];
  if (description) {
    description.split("\n");
  }  
  if (!lines.find(el => el.startsWith(user))) {
    lines.push(user);
  }
  return lines.join("\n");
}

function removeUser(description, user) {
  let lines = [];
  if (description) {
    description.split("\n");
  }
  let userLine = -1;
  for(let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(user)) {
      userLine = i;
    }
  }
  if (userLine != -1) {
    lines.splice(userLine , 1);
  }
  return lines.join("\n");
}

module.exports = {
  name: 'bidscreen',
  execute: function(reaction, user) {
    const dkpUsername = sanitize.getNickname(user, reaction.message.guild);
    // Get user dkp value
    return dkp.query(reaction.message.guild, dkpUsername).then((dkpUser) => {
      if (!dkpUser) {
        throw new Error("dkp user not found: " + dkpUsername);
      }
      const message = reaction.message;
      let all = tableview.parse(message, []);
      if (reaction.emoji.name === 'bid' && !all.find((el) => el.username === dkpUser.username)) {
        all.push(dkpUser);
      }
      else if (reaction.emoji.name === 'cancel') {
        all = all.filter(item => item.username !== dkpUser.username)
      }
      return tableview.serialize(message, all);
    });
  }
}