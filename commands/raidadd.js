const raid = require('../util/raid.js')
const sanitize = require('../util/sanitize.js');
const config = require('../config.json');

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
    const channel = message.guild.channels.find(ch => ch.name === config.raidAnnounceChannel);
    return channel.fetchMessage(args[0])
      .then(message => {
        return raid.update("unknown", message, sanitize.name(args[1]));
      })
  }
};
