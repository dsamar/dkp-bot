const Discord = require('discord.js')
const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'zerosum',
	description: 'returns the current sum of all dkp. this should be zero, so its a way to verify that',
  aliases: ['debug'],
  officer: true,
  locks: ['dkp'],
	execute(message, args) {
    return dkp.getallsum(message.guild).then((sum) => {
      return message.channel.send("the current sum of all DKP is: " + sum + "\n");
    });
  }
};
