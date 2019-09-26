const raid = require('../util/raid.js')
const sanitize = require('../util/sanitize.js');
const config = require('../config.json');

module.exports = {
	name: 'raidadd',
	description: 'adds member to a raid roster',
  usage: '<raid_id> <username> <class>',
  args: true,
  aliases: ['add'],
  officer: true,
  locks: ["raid"],
	execute(message, args) {
    // args[0] == raid ID
    // args[1] == member name
    // args[2] == class/type
    if (args.length < 3) {
      throw new Error("this function takes three arguments");
    }
    const channel = message.guild.channels.find(ch => ch.name === config.raidAnnounceChannel);
    return channel.fetchMessage(args[0])
      .then(message => {
        return raid.update(args[2], message, [sanitize.name(args[1])]);
      })
  }
};
