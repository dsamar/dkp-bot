const Discord = require('discord.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'dkpremove',
	description: 'remove a member from the dkp leaderboard',
  usage: '<username>',
  args: true,
  aliases: [],
  officer: true,
  locks: ['dkp'],
	execute(message, args) {
    // args[0] == username
    if (args.length < 1) {
      throw new Error("!dkpremove takes a username argument.");
    }
    const username = sanitize.name(args[0]);
    return dkp.dkpRemove(message.guild, username).then(() => {
      return message.channel.send(username + " was removed from the dkp leaderboard");
    });
  }
};