const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')

module.exports = {
	name: 'dkpadd',
	description: 'Adds dkp to the current roster',
  args: true,
  usage: '',
	execute(message, args) {
    // args[0] == dkp value
    // args[1] == reason
    raid.getCurrentRaidRoster(message.channel).then(roster => {
      const number = parseFloat(args[0]);
      const valueFn = (prev) => { return prev + number; };
      return dkp.updateDkp(message.guild, roster, valueFn)
    });
  }
};
