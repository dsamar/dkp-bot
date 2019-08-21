const raid = require('../util/raid.js')

module.exports = {
  name: 'raidsignup',
  execute: function(reaction, user) {
    // get guildmember, use gm.nickname, fallback to user.username
    let dkpUsername = user.username;
    const members = reaction.message.guild.members;
    const guildUser = members.find((gm) => {
      return gm.user.id === user.id;
    });
    if (guildUser && guildUser.nickname) {
      dkpUsername = guildUser.nickname;
    }
    return raid.update(reaction.emoji.name, reaction.message, dkpUsername);
  }
}