const raid = require('../util/raid.js')
const sanitize = require('../util/sanitize.js');

module.exports = {
  name: 'raidsignup',
  execute: function(reaction, user) {
    // get guildmember, use gm.nickname, fallback to user.username
    const dkpUsername = sanitize.getNickname(user, reaction.message.guild);
    return raid.update(reaction.emoji.name, reaction.message, dkpUsername);
  }
}