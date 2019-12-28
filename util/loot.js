const Discord = require("discord.js");
const { reactionTagName, leaderboardName } = require("../config.json");
const leveldb = require("./leveldb.js");
const attendance = require("./attendance.js");

module.exports = {
  lootEntry: function(guildID, itemName, cost, user) {
    return leveldb.getCurrentRaidID(guildID).then((raidID) => {
      return leveldb.lootAdd(guildID, raidID, {
        itemName: itemName,
        cost: cost,
        user: user
      });
    });
  },
  lootList: function(guildID, raidID) {
    return leveldb.lootList(guildID, raidID);
  }
};
