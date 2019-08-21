const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const sanitize = require('../util/sanitize.js');

function getField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  if (!field) {
    message.addField(fieldName, '0');
    field = message.fields.find(field => field.name === fieldName);
  };
  return field;
}

module.exports = {
	name: 'dkpspend',
	description: 'Spends dkp from one member, while awarding dkp to rest of roster.',
  args: true,
  usage: '',
  aliases: ['bidend', 'winner'],
	execute(message, args) {
    // args[0] == bidID
    // args[1] == username
    return message.channel.fetchMessage(args[0]).then(fetched => {
      const cost = parseFloat(getField(fetched.embeds[0], "cost").value);
      const username = sanitize.name(args[1]);      
      return raid.getCurrentRaidRoster(message.channel).then(roster => {
        // Check that username is in the current roster
        if (!roster.includes(username)) {
          throw new Error(username + " not in the current roster: " + roster);
        }
        return dkp.spendDkp(message.guild, roster, username, cost)
      }).then(() => {
        return message.reply(username + " was awarded " + args[0] + " for value: " + cost);
      });
    });
  }
};
