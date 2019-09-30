const Discord = require('discord.js')
const {reactionTagName, leaderboardName} = require('../config.json');
const tableview = require('./tableview.js');

const MESSAGE_LIMIT = 1500;

function contentFromMessages(messages) {
  const messageArray = messages.sort((a, b) => a.id - b.id);
  return messageArray
    .filter((m) => m.content !== "PLACEHOLDER")
    .map((m) => {
      let str = m.content.trim();
      str = str.slice(3, str.length - 3);
      return str;
    }).join("\n");
}

function splitToMessages(channel, messages, serialized) {
  const messageArray = messages.sort((a, b) => a.id - b.id);
  const serializedLines = serialized.split("\n");
  const numMessages = Math.ceil(serialized.length / MESSAGE_LIMIT);
  const chunkSize = Math.floor(serializedLines.length / numMessages);

  const promiseList = [];
  for (let i = 0; i < numMessages; i++) {
    let currentContent = "";
    if (i != numMessages - 1 ) {
      currentContent = "```" + serializedLines.slice(i*chunkSize, (i+1)*chunkSize).join("\n") + "```";
    } else {
      currentContent = "```" + serializedLines.slice(i*chunkSize).join("\n") + "```";
    }
    if (i > messageArray.length - 1) {
      promiseList.push(channel.send(currentContent).then((toPin) => toPin.pin()));
    } else {
      promiseList.push(messageArray[i].edit(currentContent));
    }
  }
  // blank out rest of messages from numMessages -> messages.length();
  for (let i = numMessages + 1; i < messageArray.length; i++) {
    promiseList.push(messageArray[i].edit("PLACEHOLDER"));
  }  
  return Promise.all(promiseList);
}

module.exports = {
  setup: function(guild) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);    
    const content = "PLACEHOLDER";
    return channel.send(content).then(leaderboard => {
      return leaderboard.pin();
    });
  },
  all: function(guild) {
    // Returns a promise with the dkpUser object.
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      return tableview.parse(contentFromMessages(messages.array()), []);
    });
  },
  query: function(guild, user) {
    // Returns a promise with the dkpUser object.
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), []);
      
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
      const all = tableview.parse(contentFromMessages(messages.array()), roster);

      // decrement spend user, increment roster, IMPORTANT: spend user gets rewarded too.
      all.forEach((member) => {
        if (username === member.username) {
          member.value -= value;
        }
        // Always increment value for members in roster, even if the member spent dkp on the item.
        if (roster.includes(member.username)) {
          member.value += value / (roster.length);
        }
      });
      
      // set attendance if this is a brand new member
      all.forEach((member) => {
        if (member.attendance.length === 0) {
          member.attendance = [false];
        }       
      });
      
      const serialized = tableview.serializeRegular(all);
      return splitToMessages(channel, messages.array(), serialized);
    });
  },
  adjust: function(guild, username, value) {
    if (isNaN(value)) throw new Error('unable to adjust dkp, value is not a number: ' + value);
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), []);
      if (all.length === 1 || all.length === 0) {
        throw new Error("unable to adjust DKP, leaderboard needs to be set up and have at least 2 members present");
      }
      
      if (!all.find((el) => el.username === username)) {
        throw new Error("user not found: " + username);
      }
      
      // decrement spend user, increment everyone else on the leaderboard
      all.forEach((member) => {
        if (username === member.username) {
          member.value += value;
        } else {
          member.value -= value / (all.length - 1);
        }
      });
      
      const serialized = tableview.serializeRegular(all);
      return splitToMessages(channel, messages.array(), serialized);
    });
  },
  trade: function(guild, source, destination, value) {
    if (isNaN(value)) throw new Error('unable to adjust dkp, value is not a number: ' + value);
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), []);
      if (all.length === 1 || all.length === 0) {
        throw new Error("unable to trade DKP, leaderboard needs to be set up and have at least 2 members present");
      }
      
      let source_user = all.find((el) => el.username === source);
      let dest_user = all.find((el) => el.username === destination);
      if (!source_user) {
        throw new Error("source user not found: " + source);
      }
      if (!dest_user) {
        throw new Error("source user not found: " + destination);
      }
      source_user.value -= value;
      dest_user.value += value;
      
      const serialized = tableview.serializeRegular(all);
      return splitToMessages(channel, messages.array(), serialized);
    });
  },
  addRoster: function(guild, roster) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), roster);
      all.forEach(dkpUser => {
        if (dkpUser.attendance.length === 0) {
          dkpUser.attendance = [false];
        }
      });
      const serialized = tableview.serializeRegular(all);
      return splitToMessages(channel, messages.array(), serialized);
    });
  },
  incrementAttendance: function(guild, roster) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), roster);
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          tableview.addAttendance(member);
        } else {
          tableview.markMissedAttendance(member);
        }          
      });
      
      const serialized = tableview.serializeRegular(all);
      return splitToMessages(channel, messages.array(), serialized);
    });
  },
  updateDkp: function(guild, roster, valueFn) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), roster);
      
      // Apply valueFn
      all.forEach((member) => {
        if (roster.includes(member.username)) {
          member.value = valueFn(member.value);
        }
      });
      
      const serialized = tableview.serializeRegular(all);
      return splitToMessages(channel, messages.array(), serialized);
    });
  },
  importDkp: function(guild, importMessages) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    const content = contentFromMessages(importMessages);
    const all = tableview.parse(content, []);
    const serialized = tableview.serializeRegular(all);
    return channel.fetchPinnedMessages().then(messages => {      
      return splitToMessages(channel, messages.array(), serialized);
    });
  },
  setAttendance: function(guild, username, history) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), [username]);
      
      // Set the history.
      all.forEach((member) => {
        if (username === member.username) {
          tableview.setAttendance(member, history);
        }
      });
      
      const serialized = tableview.serializeRegular(all);
      return splitToMessages(channel, messages.array(), serialized);
    });
  },
  setClass: function(guild, username, className) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), [username]);
      
      // Set the className.
      all.forEach((member) => {
        if (username === member.username) {
          member.class = className;
        }
      });
      
      const serialized = tableview.serializeRegular(all);
      return splitToMessages(channel, messages.array(), serialized);
    });
  }
}