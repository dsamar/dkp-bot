const Discord = require('discord.js')
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
	name: 'bidend',
	description: 'Spends dkp from one member, while awarding dkp to rest of roster.',
  args: true,
  usage: '',
  aliases: ['dkpspend', 'winner'],
  officer: true,
	execute(message, args) {
    // args[0] == bidID
    // args[1] == username
    
    // todo: check if bid already ended
    return message.channel.fetchMessage(args[0]).then(fetched => {
      const cost = parseFloat(getField(fetched.embeds[0], "cost").value);
      const username = sanitize.name(args[1]);      
      return raid.getCurrentRaidRoster(message.channel.guild).then(roster => {
        // Check that username is in the current roster
        if (!roster.includes(username)) {
          throw new Error(username + " not in the current roster: " + roster);
        }
        
        // Set winner on bid screen
        const receivedEmbed = fetched.embeds[0];
        const newEmbed = new Discord.RichEmbed(receivedEmbed);
        newEmbed.addField("winner", username);
        newEmbed.setColor("RED");
        const promise1 = fetched.edit("", newEmbed);
        const promise2 = dkp.spendDkp(message.guild, roster, username, cost)
        const promise3 = fetched.clearReactions();
        return Promise.all([promise1, promise2, promise3]);
      }).then(() => {
        return message.channel.send(username + " was awarded winning bid on " + sanitize.makeMessageLink(fetched) + " for cost: " + cost);
      });
    });
  }
};
