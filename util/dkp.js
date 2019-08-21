const Discord = require('discord.js')
const {reactionTagName, leaderboardName} = require('../config.json');
const tableview = require('./tableview.js');

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
  query: function(guild, user) {
    // Returns a promise with the dkpUser object.
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message, []);
      
      return all.find((el) => {
        return el.username === user;
      });
    });
  },
  spendDkp: function(guild, roster, username, value) {
    if (isNaN(value)) throw new Error('unable to spend dkp, value to spend is not a number: ' + value);
    // Returns a promise with the dkp value.
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message, roster);

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
      
      return tableview.serialize(message, all);
    });
  },
  incrementAttendance: function(guild, roster) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    // This channel should only have 1 message.
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message, roster);
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.attended += 1;
        } else {
          member.missed += 1;
        }          
      });
      
      return tableview.serialize(message, all);
    });
  },
  updateDkp: function(guild, roster, valueFn) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    // This channel should only have 1 message.
    return channel.fetchPinnedMessages().then(messages => {
      const message = messages.first();
      const all = tableview.parse(message, roster);
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.value = valueFn(member.value);
        }
      });
      
      return tableview.serialize(message, all);
    });
  }
}