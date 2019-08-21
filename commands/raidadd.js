const raid = require('../util/raid.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'raidadd',
	description: 'todo',
  args: true,
  usage: '',
  aliases: ['add'],
  officer: true,
	execute(message, args) {
    // args[0] == raid ID
    // args[1] == member name
    return message.channel.fetchMessage(args[0])
      .then(message => {
        return raid.update("unknown", message, sanitize.name(args[1]));
      })
  }
};
