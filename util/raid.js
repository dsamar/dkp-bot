const Discord = require('discord.js')
const {reactionTagName, raidAnnounceChannel} = require('../config.json');
const sanitize = require('./sanitize.js');

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
  update: function(type, message, username) {
    username = username.toLowerCase();
    const raidMessage = message.embeds[0];
    const newEmbed = new Discord.RichEmbed(raidMessage);
    const signupList = getField(newEmbed, "signup-list");
    
    if (type === 'cancel') {
      removeUser(signupList, username);
    } else {
      // TODO: Add other classes and specs.
      addUser(signupList, username);
      removeUser(signupList, '<empty>');
    }
    
    const totalPlayers = getField(newEmbed, "total-players");
    totalPlayers.value = signupList.value.split("\n").length;
    return message.edit("", newEmbed);
  },
  clearCurrentRaids: function(guild) {
    // Returns a promise that finished when all messages are unpinned.
    const channel = guild.channels.find(ch => ch.name === raidAnnounceChannel);
    return channel.fetchPinnedMessages()
      .then(messages => {
        return Promise.all(messages.map(message => {
          const tag = message.embeds[0].fields.find(field => field.name === reactionTagName);
          if (tag.value == 'raidsignup') {
            return message.unpin();
          }
        }));
      });
  },
  getRoster: function(message) {
    // message should be a raidsignup message
    // returns a list
    // todo: deduplicate with function below.
    const tag = message.embeds[0].fields.find(field => field.name === reactionTagName);
    if (tag.value !== 'raidsignup') {
      return [];
    }
    const signupList = getField(message.embeds[0], "signup-list");
    let lines = signupList.value.split("\n");
    lines.filter(user => user === '<empty>');
    lines = lines.map(sanitize.name);
    return lines;
  },
  getCurrentRaidRoster: function(guild) {
    // returns a promise with a list of members in current raid
    const channel = guild.channels.find(ch => ch.name === raidAnnounceChannel);
    return channel.fetchPinnedMessages()
      .then(messages => {
        let roster = [];
        // There should only be one pinned raid at a time.
        messages.forEach((message) => {
          const tag = message.embeds[0].fields.find(field => field.name === reactionTagName);
          if (tag.value == 'raidsignup') {
            const signupList = getField(message.embeds[0], "signup-list");
            let lines = signupList.value.split("\n");
            lines.filter(user => user === '<empty>');
            // sanitize roster, trim any names over 12 characters down.
            lines = lines.map(sanitize.name);
            roster = lines;
          }
        });
        return roster;
      });
  }
}

    