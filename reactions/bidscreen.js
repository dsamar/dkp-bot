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
    return dkp.all(reaction.message.guild).then((all) => {
      const dkpUser = all.find((el) => {
        return el.username === dkpUsername;
      });
      if (!dkpUser) {
        throw new Error("dkp user not found: " + dkpUsername);
      }
      const message = reaction.message;
      let allBids = tableview.parse(message.embeds[0].description  || "", []);
      if (reaction.emoji.name === 'bid' && !allBids.find((el) => el.username === dkpUser.username)) {
        allBids.push(dkpUser);
      } else if (reaction.emoji.name === 'cancel') {
        allBids = allBids.filter(item => item.username !== dkpUser.username)
      }
      // Refresh all names from source
      allBids = allBids.map((el) => all.find((allEl) => allEl.username === el.username));
      return tableview.serializeEmbedded(message, allBids);
    });
  }
}