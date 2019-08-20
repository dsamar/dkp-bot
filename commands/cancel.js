const config = require('../config.json');

module.exports = {
	name: 'cancel',
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
