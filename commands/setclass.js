const Discord = require('discord.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'setclass',
	description: 'set a members class record',
  usage: '<username> <class>',
  args: true,
  aliases: ['class'],
  officer: true,
  locks: ['dkp'],
	execute(message, args) {
    // args[0] == username
    // args[1] == class_name
    if (args.length < 2) {
      throw new Error("!setclass takes 2 arguments, a username, and a class value");
    }
    const username = sanitize.name(args[0]);
    const className = args[1];
    return dkp.setClass(message.guild, username, className).then(() => {
      return message.channel.send(username + " had their class updated to: " + className);
    });
  }
};