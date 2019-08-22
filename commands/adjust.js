const Discord = require('discord.js')
const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'adjust',
	description: 'Adjusts dkp from one member, while offseting it to the whole leaderboard.',
  args: true,
  usage: '',
  aliases: ['dkpadjust'],
  officer: true,
  locks: ['dkp'],
	execute(message, args) {
    // args[0] == username
    // args[1] == value
    if (args.length < 2) {
      throw new Error("!adjust takes 2 arguments, a username, and a value");
    }
    const username = sanitize.name(args[0]);        
    const cost = parseFloat(args[1]);
    return dkp.adjust(message.guild, username, cost).then(() => {
      return message.channel.send(username + " had their DKP adjusted by: " + cost + " DKP\n");
    });
  }
};
