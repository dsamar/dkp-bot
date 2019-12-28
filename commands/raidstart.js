const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const {raidAnnounceChannel} = require('../config.json');
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'raidstart',
	description: 'sets the active raid roster, and increments attendance for members.',
  args: true,
  usage: '<raid_id>',
  aliases: ['start', 'startraid'],
  officer: true,
  locks: ['dkp', 'raid'],
	execute(message, args) {
    // args[0] == raid ID
    return raid.clearCurrentRaids(message.channel.guild).then(() => {
      const channel = message.guild.channels.find(ch => ch.name === raidAnnounceChannel);
      return channel.fetchMessage(args[0]).then(fetched => {
        return raid.getRoster(fetched).then((roster) => {
          // Set field on raid that shows this raid is was already started
          // Don't allow starting a raid more than once
          const promise1 = raid.setCurrentRaid(fetched);
          const promise2 = dkp.incrementAttendance(message.guild, roster);
          return promise1.then(() => promise2).then(() => {
             return message.channel
               .send(sanitize.makeMessageLink(fetched) + 
                     "\n```raid started, attendance marked for:\n" + 
                     roster.join("\n") + "```");
          });
        });        
      });
    });
  }
};
