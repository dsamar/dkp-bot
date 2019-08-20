const raid = require('../util/raid.js')

module.exports = {
  name: 'raidsignup',
  execute: function(reaction, user) {
    return raid.update(reaction.emoji.name, reaction.message, user.username);
  }
}