const config = require('../config.json');

// TODO: rework.
module.exports = {
	name: 'import',
	description: 'imports a dkp list from the message id, sets it as the current leaderboard',
  args: true,
  usage: '',
  officer: true,
  locks: [],
	execute(message, args) {
    return message.channel.fetchMessage(args[0])
      .then(fetched => {
        const channel = message.guild.channels.find(ch => ch.name === config.leaderboardName);
        return channel.fetchPinnedMessages().then(messages => {
          const leaderboard = messages.first();
          return leaderboard.edit(fetched.content).then(() => {
            return message.channel.send("successful import!");
          });
        });
      });
  }
};
