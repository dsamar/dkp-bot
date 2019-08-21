const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')

// TODO: remove this message
module.exports = {
	name: 'dkpadd',
	description: 'Adds dkp to the current roster',
  args: true,
  usage: '',
	execute(message, args) {
    // args[0] == dkp value
    return raid.getCurrentRaidRoster(message.channel.guild).then(roster => {
      const number = parseFloat(args[0]);
      if (isNaN(number)) {
        throw new Error("invalid argument: " + args[0])
      }
      const valueFn = (prev) => { return prev + number; };
      return dkp.updateDkp(message.guild, roster, valueFn)
    });
  }
};
