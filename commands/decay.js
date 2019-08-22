const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
	name: 'decay',
	description: 'Decay the dkp of all members',
  args: true,
  usage: '',
  officer: true,
	execute(message, args) {
    // args[0] == decay multiplier
    return dkp.all(message.channel.guild).then(all => {
      const roster = all.map((el) => el.username);
      const number = parseFloat(args[0]);
      if (isNaN(number)) {
        throw new Error("invalid argument: " + args[0])
      }
      const valueFn = (prev) => { return prev * number; };
      return dkp.updateDkp(message.guild, roster, valueFn).then((leaderboard) => {
        message.channel.send("decayed leaderboard dkp values with multiplier: " + args[0] + " " + sanitize.makeMessageLink(leaderboard));
      });
    });
  }
};