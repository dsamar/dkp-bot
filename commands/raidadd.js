const raid = require('../util/raid.js')
const sanitize = require('../util/sanitize.js');
const config = require('../config.json');

module.exports = {
	name: 'raidadd',
	description: 'adds member to a raid roster',
  usage: '<raid_id> <username>',
  args: true,
  aliases: ['add'],
  officer: true,
  locks: ["raid"],
	execute(message, args) {
    // args[0] == raid ID
    // args[1] == member name
    if (args.length < 2) {
      throw new Error("this function takes two arguments");
    }
    const channel = message.guild.channels.find(ch => ch.name === config.raidAnnounceChannel);
    return channel.fetchMessage(args[0])
      .then(message => {
        // If the raid already started, increment attendance, or maybe mark as late somehow.
        return raid.update("unknown", message, sanitize.name(args[1]));
      })
  }
};
