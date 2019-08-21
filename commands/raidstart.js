const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const {raidAnnounceChannel} = require('../config.json');
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'raidstart',
	description: 'todo',
  args: true,
  usage: '',
  aliases: ['start', 'startraid'],
	execute(message, args) {
    // args[0] == raid ID
    return raid.clearCurrentRaids(message.channel.guild).then(() => {
      const channel = message.guild.channels.find(ch => ch.name === raidAnnounceChannel);
      return channel.fetchMessage(args[0]).then(fetched => {
        const promise1 = fetched.pin();
        const roster = raid.getRoster(fetched);
        const promise2 = message.reply(sanitize.makeMessageLink(fetched) + " ```raid started!\nattendance marked for: " + roster + "```");
        const promise3 = dkp.incrementAttendance(message.guild, roster);
        return Promise.all([promise1, promise2, promise3]);
      });
    });
  }
};
