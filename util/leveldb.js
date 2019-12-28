const Discord = require('discord.js')
const { leaderboardName } = require("../config.json");
const tableview = require("./tableview.js");
const messagedb = require("./messagedb.js");
const level = require('level')

let db = level('dkp-storage', { valueEncoding: 'json' })

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

function newUser(username) {
  const dkpUser = {};
  dkpUser.username = username;
  dkpUser.value = 0;
  dkpUser.attendance = [];
  dkpUser.class = '?';
  return dkpUser;
}

function removeDupes(dkpUserList) {
  return dkpUserList
    .sort((a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0))
    .filter((item, pos, ary) => {
      return !pos || item != ary[pos - 1];
    });
}

module.exports = {
  // DKP FUNCTIONS
  getAll: function(guild, currentRoster) {
    // 3) Fetch by key
    return db.get(guild.id).then((value) => {      
      currentRoster.push("guild-bank");
      currentRoster.forEach((user) => {
        if (!value.find((member) => { return member.username === user; })) {
          value.push(newUser(user));
        }
      });
      value = removeDupes(value)
      return value;
    });
  },
  // This returns a list of promises on completion for all the messages written.
  writeAll: function(guild, userList) {
    return db.put(guild.id, userList)
  },
  importDkp: function(guild, importMessages) {
    const content = contentFromMessages(importMessages);
    const all = tableview.parse(content, []);
    return db.put(guild.id, all, {})
  },
  setup: function(guild) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    return channel.fetchPinnedMessages().then(messages => {
      const all = tableview.parse(contentFromMessages(messages.array()), []);
      return db.put(guild.id, all, {})
    });
  },
  refresh: function(guild) {
    return this.getAll(guild, []).then((all) => {
      return messagedb.writeAll(guild, all);
    });
  },
  // LOOT FUNCTIONS
  lootAdd: function(guildID, raidID, lootEntry) {
    const raidKey = guildID + "-" + raidID;
    return db.get(raidKey + '-lootlog').then((lootList) => {
      if (!lootList) {
        lootList = [];
      }
      lootList.push(lootEntry);
      return db.put(raidKey + '-lootlog', lootList);
    }).catch((error) => {
      // First item in the log.
      return db.put(raidKey + '-lootlog', [lootEntry]);
    });
  },
  lootList: function(guildID, raidID) {
    const raidKey = guildID + "-" + raidID;
    return db.get(raidKey + '-lootlog');
  },
  // ROSTER/RAID FUNCTIONS
  setCurrentRaidID: function(guildID, raidID) {
    return db.put(guildID + '-currentraid', raidID);
  },
  getCurrentRaidID: function(guildID) {
    return db.get(guildID + '-currentraid');
  },
  setRoster: function(guildID, raidID, roster) {
    const raidKey = guildID + "-" + raidID;
    return db.put(raidKey + '-roster', roster);
  },
  getRoster: function(guildID, raidID) {
    const raidKey = guildID + "-" + raidID;
    return db.get(raidKey + '-roster');
  }
}