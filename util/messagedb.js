const Discord = require('discord.js')
const { leaderboardName } = require("../config.json");
const tableview = require("./tableview.js");

const MESSAGE_LIMIT = 1500;

function contentFromMessages(messages) {
  const messageArray = messages.sort((a, b) => a.id - b.id);
  return messageArray
    .filter(m => m.content !== "PLACEHOLDER")
    .map(m => {
      let str = m.content.trim();
      str = str.slice(3, str.length - 3);
      return str;
    })
    .join("\n");
}

function splitToMessages(channel, messages, serialized) {
  const messageArray = messages.sort((a, b) => a.id - b.id);
  const serializedLines = serialized.split("\n");
  const numMessages = Math.ceil(serialized.length / MESSAGE_LIMIT);
  const chunkSize = Math.floor(serializedLines.length / numMessages);

  const promiseList = [];
  for (let i = 0; i < numMessages; i++) {
    let currentContent = "";
    if (i != numMessages - 1) {
      currentContent =
        "```" +
        serializedLines.slice(i * chunkSize, (i + 1) * chunkSize).join("\n") +
        "```";
    } else {
      currentContent =
        "```" + serializedLines.slice(i * chunkSize).join("\n") + "```";
    }
    if (i > messageArray.length - 1) {
      promiseList.push(channel.send(currentContent).then(toPin => toPin.pin()));
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
  // This returns promise to a list of users.
  getAll: function(guild, currentRoster) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      return tableview.parse(contentFromMessages(messages.array()), currentRoster);
    });
  },
  // This returns a list of promises on completion for all the messages written.
  writeAll: function(guild, userList) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const serialized = tableview.serializeRegular(userList);
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
}