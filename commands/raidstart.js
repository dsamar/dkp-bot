const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')

module.exports = {
	name: 'raidstart',
	description: 'todo',
  args: true,
  usage: '',
	execute(message, args) {
    // args[0] == raid ID
    return raid.clearCurrentRaids(message.channel).then(() => {
      return message.channel.fetchMessage(args[0]).then(fetched => {
        fetched.pin();
        const roster = raid.getRoster(fetched);
        message.reply("marked attendance for: " + roster);
        return dkp.incrementAttendance(message.guild, roster);
      });
    });
  }
};
