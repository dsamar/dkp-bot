const config = require('../config.json');
const dkp = require('../util/dkp.js');
const leveldb = require('../util/leveldb.js');

module.exports = {
	name: 'refresh',
	description: 'refresh the leaderboard display based on database values',
  officer: true,
  locks: [],
	execute(message, args) {
      return leveldb.refresh(message.guild).then(() => {
        message.channel.send(
          "refreshed dkp leaderboard display!"
        );
      });
  }
};
