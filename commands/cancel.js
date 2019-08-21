const config = require('../config.json');

module.exports = {
	name: 'cancel',
	description: 'Deletes a message, using the message id',
  args: true,
  usage: '',
  officer: true,
	execute(message, args) {
    // Check the raid announce channel.
    const channel = message.guild.channels.find(ch => ch.name === config.raidAnnounceChannel);
    const promise1 = channel.fetchMessage(args[0])
      .then(fetched => {
        return fetched.delete();
      }).catch(() => {});
    
    // Also check current channel.
    const promise2 = message.channel.fetchMessage(args[0])
      .then(fetched => {
        return fetched.delete();
      }).catch(() => {});
    
    return Promise.all([promise1, promise2]).then((deleted) => {
      message.channel.send("message was removed");
    });
  }
};
