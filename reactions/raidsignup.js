const Discord = require('discord.js')

function addUser(field, user) {
  let lines = [];
  if (field.value) {
    lines = field.value.split("\n");
  }  
  if (!lines.find(el => el.startsWith(user))) {
    lines.push(user);
  }
  field.value = lines.join("\n");
}

function removeUser(field, user) {
  let lines = [];
  if (field.value) {
    lines = field.value.split("\n");
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
  if (lines.length == 0) {
    lines.push('<empty>');
  }
  field.value = lines.join("\n");
}

function getField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  if (!field) {
    message.addField(fieldName, '<empty>');
    field = message.fields.find(field => field.name === fieldName);
  };
  return field;
}

module.exports = {
  name: 'raidsignup',
  execute: function(reaction, user) {
    const raidMessage = reaction.message.embeds[0];
    const newEmbed = new Discord.RichEmbed(raidMessage);
    const signupList = getField(newEmbed, "signup-list");
    
    if (reaction.emoji.name === 'cancel') {
      removeUser(signupList, user.username);
    } else {
      addUser(signupList, user.username);
      removeUser(signupList, '<empty>');
    }
    
    const totalPlayers = getField(newEmbed, "total-players");
    totalPlayers.value = signupList.value.split("\n").length;
    reaction.message.edit(null, newEmbed);
  }
}