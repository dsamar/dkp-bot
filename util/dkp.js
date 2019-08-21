const Discord = require('discord.js')
const {reactionTagName, leaderboardName} = require('../config.json');
const {table} = require('table')

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
  const attendancePercentage = dkpUser.attended / (dkpUser.attended + dkpUser.missed) * 100;
  return [ dkpUser.username, parseFloat(dkpUser.value).toFixed(2), dkpUser.attended, dkpUser.missed, attendancePercentage.toFixed(2) + " %"];
}
function stringToUser(string) {
  const dkpUser = {};
  const list = string.split('│').map((el) => {
    el = el.replace('║',' ');
    return el.trim();
  });
  dkpUser.username = list[0];
  dkpUser.value = parseFloat(list[1]);
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

function parseLeaderBoard(message, roster) {
  // sanitize roster, trim any names over 12 characters down.
  roster = roster.map((name) => {
    const length = 15;
    name = name.length > length ? 
           name.substring(0, length - 3) + "..." : 
           name;
    return name;
  });
  let description = message.embeds[0].description  || "";
  let all = description.split("\n").slice(3, -1).map((line) => {
    return stringToUser(line);
  });
  all = all.filter((el) => {
    if (isNaN(el.value)) return false;
    return (el != null && el.username != "");
  });
  
  // Add any new users from roster.
  roster.forEach((user) => {
    if (!all.find((member) => { return member.username === user; })) {
      all.push(newUser(user));
    }
  });
  
  return all;
}

function serializeAndUpdate(message, all) {
  // Sort by value, descending.
  all.sort((a,b) => { return b.value-a.value; });
  // Turn back into a string.
  const updatedMessage = new Discord.RichEmbed(message.embeds[0]);
  const data = all.map((member) => {
    return userToString(member);
  });
  // add header
  data.unshift(['username', 'dkp', '✓', 'X', 'attendance'])
  const config = {
    drawHorizontalLine: (index, size) => {
      return index === 0 || index === 1 || index === size;
    }
  };
  const output = table(data, config);
  updatedMessage.setTitle("DKP LEADERBOARD");
  updatedMessage.setDescription("```" + output + "```");
  updatedMessage.setTimestamp();
  return message.edit(updatedMessage);
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
      const all = parseLeaderBoard(message, roster);
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.attended += 1;
        } else {
          member.missed += 1;
        }          
      });
      
      return serializeAndUpdate(message, all);
    });
  },
  updateDkp: function(guild, roster, valueFn) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    // This channel should only have 1 message.
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = parseLeaderBoard(message, roster);
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.value = valueFn(member.value);
        }
      });
      
      return serializeAndUpdate(message, all);
    });
  }
}