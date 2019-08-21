const config = require('../config.json');

module.exports = {
	name: 'cancel',
	description: 'todo',
  args: true,
  usage: '',
	execute(message, args) {
    return message.channel.fetchMessage(args[0])
      .then(message => {
        return message.delete();
      });
  }
};
