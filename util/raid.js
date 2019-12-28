const Discord = require('discord.js')
const {reactionTagName, raidAnnounceChannel} = require('../config.json');
const sanitize = require('./sanitize.js');
const leveldb = require('./leveldb.js');
const CLASS_LIST = ["warrior", "mage", "hunter", "warlock", "rogue", "druid", "shaman", "paladin", "priest"];

function getClassField(type, embed, guild) {
  const emoji = guild.emojis.find(em => em.name === type).toString();
  return embed.fields.find(field => field.name === emoji) || embed.fields.find(field => field.name === type);
}

function removeField(embed, fieldName, guild) {
  let fieldLine = -1;
  const emoji = guild.emojis.find(em => em.name === fieldName).toString();
  for(let i = 0; i < embed.fields.length; i++) {
    if (embed.fields[i].name === fieldName || embed.fields[i].name === emoji) {
      fieldLine = i;
    }
  }
  if (fieldLine != -1) {
    embed.fields.splice(fieldLine , 1);
  }
}

function unserialize(embed, guild) {
  let signups = [];
  CLASS_LIST.forEach(cl => {
    const field = getClassField(cl, embed, guild);
    if (field) {
      const classSignups = field.value.split("\n").map((str) => {
        return {"user": str.trim(), "type": cl};
      });
      signups = signups.concat(classSignups);
    }
  });
  signups = signups.filter((item, index) => {
    return signups.map(el => el.user).indexOf(item.user) === index;
  });
  return signups;
}

function serialize(signups, guild, embed) {
  // const emoji = guild.emojis.find(em => em.name === el.type).toString();
  let ret = "";
  if (!signups.length) {
    return;
  }
  
  // remove all existing class fields from message.
  CLASS_LIST.forEach(cl => {
    removeField(embed, cl, guild);
  });
  
  // add them all back.
  signups.forEach(user => {
    let field = getClassField(user.type, embed, guild);
    if (!field) {
      const emoji = guild.emojis.find(em => em.name === user.type).toString();
      embed.addField(emoji, user.user, /*inline=*/true);
    } else {
      const list = field.value.split("\n");
      list.push(user.user);
      list.sort();
      field.value = list.join("\n");
    }
  });
}

function addUser(signups, user, type) {
  const signedupUser = signups.find(el => el.user === user);
  if (!signedupUser) {
    signups.push({"user": user, "type": type});
  } else {
    signedupUser.type = type;
  }
}

function removeUser(signups, user) {
  let userLine = -1;
  for(let i = 0; i < signups.length; i++) {
    if (signups[i].user === user) {
      userLine = i;
    }
  }
  if (userLine != -1) {
    signups.splice(userLine , 1);
  }
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
  update: function(type, message, usernameList) {
    const raidMessage = message.embeds[0];
    const newEmbed = new Discord.RichEmbed(raidMessage);
    let signups = unserialize(newEmbed, message.guild);
    
    usernameList.forEach((username) => {
      if (type === 'cancel') {
        removeUser(signups, username.toLowerCase());
      } else if (CLASS_LIST.includes(type)) {
        addUser(signups, username.toLowerCase(), type);
      } else {
        return; // not a registered class or reaction.
      }
    });
    
    // Sort by class.
    signups.sort((a,b) => {
      return a.type.localeCompare(b.type); 
    });
    
    // update the roster in the raid database.
    const databaseUpdate = leveldb.setRoster(message.guild.id, message.id, signups.map((el) => el.user));
    
    serialize(signups, message.guild, newEmbed);
    
    const totalPlayers = getField(newEmbed, "total-players");
    totalPlayers.value = signups.length;
    return Promise.all([message.edit("", newEmbed), databaseUpdate]);
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
    return leveldb.getRoster(message.guild.id, message.id);
  },
  setCurrentRaid(message) {
    const raidMessage = message.embeds[0];
    const newEmbed = new Discord.RichEmbed(raidMessage);
    let signups = unserialize(newEmbed, message.guild);
    return leveldb.setRoster(message.guild.id, message.id, signups.map((el) => el.user)).then(() => {
      const promise1 = message.pin();
      const promise2 = leveldb.setCurrentRaidID(message.guild.id, message.id);
      return Promise.all([promise1, promise2]);
    });
  },
  getCurrentRaidRoster: function(guild) {
    return leveldb.getCurrentRaidID(guild.id).then((raidID) => {
      return leveldb.getRoster(guild.id, raidID);
    });
  },
  getCurrentRaidID: function(guild) {
    return leveldb.getCurrentRaidID(guild.id);
  }
}

    