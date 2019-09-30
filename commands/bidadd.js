const Discord = require('discord.js')
const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');
const tableview = require('../util/tableview.js');

function getField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  if (!field) {
    message.addField(fieldName, '0');
    field = message.fields.find(field => field.name === fieldName);
  };
  return field;
}

module.exports = {
	name: 'bidadd',
	description: 'adds a member to a bidscreen',
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
    const username = sanitize.name(args[1]);
    // todo: check if bid already ended
    return message.channel.fetchMessage(args[0]).then(fetched => {
      if (getField(new Discord.RichEmbed(fetched.embeds[0]), "locked").value === 'true') {
        throw new Error("the item was already awarded, start a new bid with !bidstart");
      }
      
      // Get user dkp value
      return dkp.all(message.guild).then((all) => {
        const dkpUser = all.find((el) => {
          return el.username === username;
        });
        if (!dkpUser) {
          throw new Error("dkp user not found: " + username);
        }
        const message = fetched;
        let allBids = tableview.parse(message.content  || "", []);
        allBids.push(dkpUser);

        // Refresh all names from source
        allBids = allBids.map((el) => all.find((allEl) => allEl.username === el.username));
        return tableview.serializeEmbedded(message, allBids);
      });
    });
  }
};
