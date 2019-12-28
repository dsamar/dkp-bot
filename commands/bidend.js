const Discord = require('discord.js')
const raid = require('../util/raid.js')
const dkp = require('../util/dkp.js')
const loot = require('../util/loot.js')
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
	description: 'ends bidding on an item, spends dkp from one member, while awarding dkp to rest of roster',
  usage: '<bid_id> <username> [price_override]',
  args: true,
  aliases: ['dkpspend', 'winner'],
  officer: true,
  locks: ['dkp', 'raid'],
	execute(message, args) {
    // args[0] == bidID
    // args[1] == username
    // args[2] == price_override
    
    return message.channel.fetchMessage(args[0]).then(fetched => {
      if (getField(new Discord.RichEmbed(fetched.embeds[0]), "locked").value === 'true') {
        throw new Error("the item was already awarded, start a new bid with !bidstart");
      }
      if (args.length < 2) {
        throw new Error("usage: !bidend BID_ID USERNAME");
      }
      let cost = parseFloat(getField(fetched.embeds[0], "cost").value);
      if (args.length === 3) {
        cost = parseFloat(args[2]);
      }
      const username = sanitize.name(args[1]);      
      return raid.getCurrentRaidRoster(message.channel.guild).then(roster => {
        // Check that username is in the current roster
        if (!roster.includes(username) && username !== 'guild-bank') {
          throw new Error(username + " not in the current roster: " + roster);
        }
        
        // Set winner on bid screen
        const receivedEmbed = fetched.embeds[0];
        const newEmbed = new Discord.RichEmbed(receivedEmbed);
        newEmbed.addField("winner", username);
        getField(newEmbed, "locked").value = 'true';
        newEmbed.setColor("RED");
        const promise1 = fetched.edit("", newEmbed);
        const promise2 = dkp.spendDkp(message.guild, roster, username, cost)
        const promise3 = fetched.clearReactions();
        return Promise.all([promise1, promise2, promise3]);
      }).then(() => {
        return loot.lootEntry(message.guild.id, fetched.embeds[0].title.replace(/\*/g, ''), cost, username);
      }).then(() => {
        return message.channel.send(username + 
                                    " was awarded winning bid on **" + 
                                    fetched.embeds[0].title + 
                                    "** and charged: " + cost + " DKP\n" + 
                                    sanitize.makeMessageLink(fetched));
      });
    });
  }
};
