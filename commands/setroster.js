const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const {raidAnnounceChannel} = require('../config.json');
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'setroster',
	description: 'mass-set people to a roster',
  args: true,
  usage: '<raid_id> <space_separated_list_of_names>',
  aliases: [],
  officer: true,
  locks: ['raid', 'dkp'],
	execute(message, args) {
    // args[0] == raid ID
    // args[1-n] = player names
    let num_players = args.length - 1
    const channel = message.guild.channels.find(ch => ch.name === raidAnnounceChannel);
    return channel.fetchMessage(args[0])
      .then(message => {
        // Make everyone a warrior, we don't really care here.
        return raid.update('warrior', message, args.slice(1));
      })
  }
};
