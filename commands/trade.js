const Discord = require('discord.js')
const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'trade',
	description: 'trade dkp from one member to another. dkp is subtracted from source, awarded to destination',
  usage: '<source_username> <destination_username> <numeric_value subtracted from source, added to destination>',
  args: true,
  aliases: [],
  officer: true,
  locks: ['dkp'],
	execute(message, args) {
    // args[0] == source_username
    // args[1] == dest_username
    // args[2] == value
    if (args.length < 3) {
      throw new Error("!adjust takes 3 arguments, two usernames, and a value");
    }
    const source_username = sanitize.name(args[0]);
    const dest_username = sanitize.name(args[1]);
    const cost = parseFloat(args[2]);
    return dkp.trade(message.guild, source_username, dest_username, cost).then(() => {
      return message.channel.send(source_username + " was subtracted: " + cost + " DKP, which was then awarded to " + dest_username + "\n");
    });
  }
};