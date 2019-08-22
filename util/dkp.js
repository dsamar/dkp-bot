const Discord = require('discord.js')
const {reactionTagName, leaderboardName} = require('../config.json');
const tableview = require('./tableview.js');

// TODO: Spread leaderboard over multiple messages.
// Limit is 2000 characters per message.
module.exports = {
  setup: function(guild) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);    
    const content = "DKP LEADERBOARD";
    return channel.send(content).then(leaderboard => {
      return leaderboard.pin();
    });
  },
  all: function(guild) {
    // Returns a promise with the dkpUser object.
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      return tableview.parse(message.content, []);
    });
  },
  query: function(guild, user) {
    // Returns a promise with the dkpUser object.
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message.content, []);
      
      return all.find((el) => {
        return el.username === user;
      });
    });
  },
  spendDkp: function(guild, roster, username, value) {
    if (roster.length === 1) {
      throw new Error("unable to spend DKP if there is only one member in the raid");
    }
    if (roster.length === 0) {
      throw new Error("you need to set up an active raid to start awarding dkp");
    }
    if (isNaN(value)) throw new Error('unable to spend dkp, value to spend is not a number: ' + value);
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message.content, roster);

      // decrement spend user, increment roster
      console.log(value);
      all.forEach((member) => {
        if (username === member.username) {
          member.value -= value;
        }
        if (roster.includes(member.username) && username !== member.username) {
          member.value += value / (roster.length - 1);
        }
      });
      
      return tableview.serializeRegular(message, all);
    });
  },
  adjust: function(guild, username, value) {
    if (isNaN(value)) throw new Error('unable to adjust dkp, value is not a number: ' + value);
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message.content, []);
      if (all.length === 1 || all.length === 0) {
        throw new Error("unable to adjust DKP, leaderboard needs to be set up and have at least 2 members present");
      }
      
      // decrement spend user, increment everyone else
      all.forEach((member) => {
        if (username === member.username) {
          member.value += value;
        } else {
          member.value -= value / (all.length - 1);
        }
      });
      
      return tableview.serializeRegular(message, all);
    });
  },
  incrementAttendance: function(guild, roster) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    // This channel should only have 1 message.
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message.content, roster);
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.attended += 1;
        } else {
          member.missed += 1;
        }          
      });
      
      return tableview.serializeRegular(message, all);
    });
  },
  updateDkp: function(guild, roster, valueFn) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    // This channel should only have 1 message.
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message.content, roster);
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.value = valueFn(member.value);
        }
      });
      
      return tableview.serializeRegular(message, all);
    });
  }
}