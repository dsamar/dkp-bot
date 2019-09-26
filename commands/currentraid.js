const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const {raidAnnounceChannel} = require('../config.json');
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'currentraid',
	description: 'sets the currently active raid, without incrementing attendance',
  args: true,
  usage: '<raid_id>',
  aliases: [],
  officer: true,
  locks: ['raid', 'dkp'],
	execute(message, args) {
    // args[0] == raid ID
    return raid.clearCurrentRaids(message.channel.guild).then(() => {
      const channel = message.guild.channels.find(ch => ch.name === raidAnnounceChannel);
      return channel.fetchMessage(args[0]).then(fetched => {
        const roster = raid.getRoster(fetched);
        const promise1 = fetched.pin();
        const promise2 = dkp.addRoster(message.guild, roster);
        return Promise.all([promise1, promise2]).then(() => {
           return message.channel.send(sanitize.makeMessageLink(fetched) + " ```updated raid roster:\n" + roster.join("\n") + "```");
        });
      });
    });
  }
};