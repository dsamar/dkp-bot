const Discord = require('discord.js')
const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'refund',
	description: 'refunds dkp from to one member, while subtracting dkp to rest of roster.',
  args: true,
  usage: '',
  aliases: ['reverse'],
  officer: true,
  locks: ['dkp', 'raid'],
	execute(message, args) {
    // args[0] == username
    // args[1] == value
    if (args.length < 2) {
      throw new Error("!refund takes 2 arguments, a username, and a value");
    }
    const username = sanitize.name(args[0]);        
    const cost = parseFloat(args[1]);
      
    return raid.getCurrentRaidRoster(message.channel.guild).then(roster => {
      // Check that username is in the current roster
      if (!roster.includes(username)) {
        throw new Error(username + " not in the current roster: " + roster);
      }
      return dkp.spendDkp(message.guild, roster, username, cost*-1)
    }).then(() => {
      return message.channel.send(username + " had their DKP refunded by: " + cost + " DKP\n");
    });
  }
};
