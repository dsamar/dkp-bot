const raid = require('../util/raid.js')

module.exports = {
	name: 'raidstart',
	description: 'todo',
  args: true,
  usage: '',
	execute(message, args) {
    // args[0] == raid ID
    message.channel.fetchMessage(args[0])
      .then(fetched => {
        fetched.pin().then(() => {
          raid.getCurrentRaidRoster(message.channel).then((results) => {
            console.log(results);
          });
        });
        
        // TODO: unpin/end all other raids, so that we only have one roster to deal with.
      })
  }
};
