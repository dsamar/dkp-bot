const Discord = require('discord.js')
const {reactionTagName, leaderboardName} = require('../config.json');

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

// A dkpUser object has 3 fields
// username, value, #attended, #missed

function userToString(dkpUser) {
  return dkpUser.username + " | " + dkpUser.value + " | " + dkpUser.attended + " | " + dkpUser.missed;
}
function stringToUser(string) {
  const dkpUser = {};
  const list = string.split(' | ')
  dkpUser.username = list[0];
  dkpUser.value = parseInt(list[1]);
  dkpUser.attended = parseInt(list[2]);
  dkpUser.missed = parseInt(list[3]);
  return dkpUser;
}
function newUser(username) {
  const dkpUser = {};
  dkpUser.username = username;
  dkpUser.value = 0;
  dkpUser.attended = 0;
  dkpUser.missed = 0;
  return dkpUser;
}

module.exports = {
  setup: function(guild) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);    
    const content = new Discord.RichEmbed();
    content.setTitle("DKP LEADERBOARD");
    content.setTimestamp();
    content.setDescription("");
    return channel.send(content).then(leaderboard => {
      return leaderboard.pin();
    });
  },
  queryDkp: function(guild, user) {
    // Returns a promise with the dkp value.
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      // TODO
    });
  },
  incrementAttendance: function(guild, roster) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    // This channel should only have 1 message.
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const updatedMessage = new Discord.RichEmbed(message.embeds[0]);
      let description = updatedMessage.description  || "";
      let all = description.split("\n").map((line) => {
        return stringToUser(line);
      });
      all = all.filter((el) => {
        return (el != null && el.username != "");
      });
      
      // Add any new users from roster.
      roster.forEach((user) => {
        if (!all.find((member) => { return member.username === user; })) {
          all.push(newUser(user));
          console.log("added new user: " + user);
        }
      });
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.attended += 1;
        } else {
          member.missed += 1;
        }          
      });
      
      // Sort by value, descending.
      all.sort((a,b) => { return b.value-a.value; });
      // Turn back into a string.
      updatedMessage.setDescription(all.map((member) => {
        return userToString(member);
      }).join("\n"));
      updatedMessage.setTimestamp();
      return message.edit("", updatedMessage);
    });
  },
  updateDkp: function(guild, roster, valueFn) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    // This channel should only have 1 message.
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const updatedMessage = new Discord.RichEmbed(message.embeds[0]);
      let description = updatedMessage.description  || "";
      let all = description.split("\n").map((line) => {
        return stringToUser(line);
      });
      all = all.filter((el) => {
        return (el != null && el.username != "");
      });
      
      // Add any new users from roster.
      roster.forEach((user) => {
        if (!all.find((member) => { return member.username === user; })) {
          all.push(newUser(user));
          console.log("added new user: " + user);
        }
      });
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.value = valueFn(member.value);
        }
      });
      
      // Sort by value, descending.
      all.sort((a,b) => { return b.value-a.value; });
      // Turn back into a string.
      updatedMessage.setDescription(all.map((member) => {
        return userToString(member);
      }).join("\n"));
      updatedMessage.setTimestamp();
      return message.edit("", updatedMessage);
    });
  }
}