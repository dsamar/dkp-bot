const Discord = require('discord.js')
const config = require('../config.json');

module.exports = {
	name: 'deleteraid',
	description: 'todo',
  args: true,
  usage: '',
	execute(message, args) {
    message.channel.fetchMessage(args[0])
      .then(message => {
        message.delete();
      }).catch(error => {
        message.reply(error.message)
      });
  }
};
