const raid = require('../util/raid.js')
const sanitize = require('../util/sanitize.js');
const config = require('../config.json');

module.exports = {
	name: 'raidremove',
	description: 'todo',
  args: true,
  usage: '',
  aliases: ['remove'],
  officer: true,
	execute(message, args) {
    // args[0] == raid ID
    // args[1] == member name
    const channel = message.guild.channels.find(ch => ch.name === config.raidAnnounceChannel);
    return message.channel.fetchMessage(args[0])
      .then(message => {
        return raid.update("cancel", message, sanitize.name(args[1]));
      })
  }
};
