const raid = require('../util/raid.js')
const sanitize = require('../util/sanitize.js');

function getField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  return field;
}

module.exports = {
  name: 'raidsignup',
  locks: ['raid'],
  execute: function(reaction, user) {
    // get guildmember, use gm.nickname, fallback to user.username
    const dkpUsername = sanitize.getNickname(user, reaction.message.guild);
    const raidMessage = reaction.message.embeds[0];
    const lockState = getField(raidMessage, "locked");
    if (lockState && lockState.value == "true") {
      return user.send("Sorry, the raid is no longer accepting signups!");
    }
    return raid.update(reaction.emoji.name, reaction.message, [dkpUsername]);
  }
}