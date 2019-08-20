const Discord = require('discord.js')

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
    const receivedEmbed = reaction.message.embeds[0];
    const newEmbed = new Discord.RichEmbed(receivedEmbed);
    if (reaction.emoji.name === 'bid') {
      newEmbed.setDescription(addUser(receivedEmbed.description, user.username));
    }
    if (reaction.emoji.name === 'cancel') {
      newEmbed.setDescription(removeUser(receivedEmbed.description, user.username));
      
    }
    reaction.message.edit("", newEmbed);
  }
}