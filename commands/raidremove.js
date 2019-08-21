const raid = require('../util/raid.js')

module.exports = {
	name: 'raidremove',
	description: 'todo',
  args: true,
  usage: '',
	execute(message, args) {
    // args[0] == raid ID
    // args[1] == member name
    return message.channel.fetchMessage(args[0])
      .then(message => {
        return raid.update("cancel", message, args[1]);
      })
  }
};
