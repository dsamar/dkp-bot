const raid = require('../util/raid.js')

module.exports = {
	name: 'raidadd',
	description: 'todo',
  args: true,
  usage: '',
	execute(message, args) {
    // args[0] == raid ID
    // args[1] == member name
    return message.channel.fetchMessage(args[0])
      .then(message => {
        return raid.update("unknown", message, args[1]);
      })
  }
};
