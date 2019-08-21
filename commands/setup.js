const dkp = require('../util/dkp.js')

module.exports = {
  name: 'setup',
	description: 'Commands for managing emojis',
  args: false,
  aliases: ['setup'],
  execute: function(message) {
    // TODO:
    // arg[0] factory-reset - optional, default false.
    const guild = message.channel.guild;
    const setup1 = Promise.all(guild.emojis.map(emoji => {
      // TODO: don't delete all emoji.
      return guild.deleteEmoji(emoji);
    })).then(() => {
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/0/02/ClassIcon_mage.png/26px-ClassIcon_mage.png?version=7b14de74abd2f13836a3127a3044d06d', 'mage');
      guild.createEmoji('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/microsoft/74/heavy-check-mark_2714.png', 'bid');
      guild.createEmoji('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/cross-mark_274c.png', 'cancel');
    });
    const setup2 = dkp.setup(guild).then(() => console.log("leaderboard setup"));
    return Promise.all([setup1, setup2]);
  }
}