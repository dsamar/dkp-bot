const config = require('../config.json');
const dkp = require('../util/dkp.js');

module.exports = {
	name: 'import',
	description: 'NOT QUITE WORKING: imports a dkp list from the message id, sets it as the current leaderboard',
  usage: '<num_messages> [message_id_1-N...]',
  args: true,
  officer: true,
  locks: [],
	execute(message, args) {
    const numMessages = parseInt(args[0]);
    if (args.length !== numMessages + 1) {
      throw new Error("usage: !import <num_messages> [message_id_1-N...]. Not enough args given." + " Got: " + args.length + " Expected: " + (numMessages + 1));
    }
    let messagePromises = [];
    for (let i = 0; i < args[0]; i++) {
      messagePromises.push(message.channel.fetchMessage(args[i+1]))
    }
    return Promise.all(messagePromises).then(values => {
      return dkp.importDkp(message.guild, values);
    });
  }
};
