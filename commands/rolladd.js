const Discord = require('discord.js')
const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');
const tableview = require('../util/tableview.js');
const item = require('../util/item.js');

module.exports = {
	name: 'rolladd',
	description: 'adds a member to a bidscreen for rolling',
  usage: '<bid_id> <username>',
  args: true,
  officer: true,
  locks: ['dkp'],
	execute(message, args) {
    // args[0] == bidID
    // args[1] == username
    if (args.length != 2) {
      throw new Error("usage: !bidadd BID_ID USERNAME");
    }
    const bidID = args[0];
    const user = sanitize.name(args[1]);
    return message.channel.fetchMessage(args[0]).then(fetched => {
      // Find username and get user object for it.
      return item.bidReact(fetched, user, "dice", false);
    });
  }
};
