const raid = require('../util/raid.js')

module.exports = {
	name: 'raidstart',
	description: 'todo',
  args: true,
  usage: '',
	execute(message, args) {
    // args[0] == raid ID
    raid.clearCurrentRaids(message.channel).then(()=> {
      message.channel.fetchMessage(args[0])
      .then(fetched => {
        fetched.pin().then(() => {
          raid.getCurrentRaidRoster(message.channel).then((results) => {
            message.reply("raid started with members: " + results);
          });
        });
      });
    });
  }
};
