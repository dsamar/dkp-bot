const raid = require('../util/raid.js')
const sanitize = require('../util/sanitize.js');
const config = require('../config.json');

module.exports = {
	name: 'raidremove',
	description: 'removes member from a raid',
  args: true,
  usage: '<raid_id> <username>',
  aliases: ['remove'],
  officer: true,
  locks: ['raid'],
	execute(message, args) {
    // args[0] == raid ID
    // args[1] == member name
    if (args.length < 2) {
      throw new Error("this function takes two arguments");
    }
    const channel = message.guild.channels.find(ch => ch.name === config.raidAnnounceChannel);
    return channel.fetchMessage(args[0])
      .then(message => {
        return raid.update("cancel", message, [sanitize.name(args[1])]);
      })
  }
};
