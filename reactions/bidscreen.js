const Discord = require('discord.js')
const sanitize = require('../util/sanitize.js');
const dkp = require('../util/dkp.js');
const tableview = require('../util/tableview.js');

function getField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  return field;
}

module.exports = {
  name: 'bidscreen',
  execute: function(reaction, user) {
    const bidMessage = reaction.message.embeds[0];
    const lockState = getField(bidMessage, "locked");
    if (lockState && lockState.value == "true") {
      return user.send("Sorry, the item is no longer accepting bids!");
    }
    
    const dkpUsername = sanitize.getNickname(user, reaction.message.guild);
    // Get user dkp value
    return dkp.query(reaction.message.guild, dkpUsername).then((dkpUser) => {
      if (!dkpUser) {
        throw new Error("dkp user not found: " + dkpUsername);
      }
      const message = reaction.message;
      let all = tableview.parse(message, []);
      if (reaction.emoji.name === 'bid' && !all.find((el) => el.username === dkpUser.username)) {
        all.push(dkpUser);
      }
      else if (reaction.emoji.name === 'cancel') {
        all = all.filter(item => item.username !== dkpUser.username)
      }
      return tableview.serialize(message, all);
    });
  }
}