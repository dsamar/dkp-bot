const Discord = require('discord.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'attendance',
	description: 'set a members attendance record',
  usage: '<username> <attendance_history>',
  args: true,
  aliases: ['setattendance'],
  officer: true,
  locks: ['dkp'],
	execute(message, args) {
    // args[0] == username
    // args[1] == attendance_history
    if (args.length < 2) {
      throw new Error("!attendance takes 2 arguments, a username, and an attendance value");
    }
    const username = sanitize.name(args[0]);
    const history = args[1];
    return dkp.setAttendance(message.guild, username, history).then(() => {
      return message.channel.send(username + " had their attendance updated to: " + history);
    });
  }
};
