const dkp = require('../util/dkp.js')

module.exports = {
  name: 'setup',
	description: 'setup emoji used by the bot and, optionally initialize the leaderboard',
  args: false,
  officer: true,
  locks: ['dkp', 'raid'],
  execute: function(message, args) {
    // TODO:
    // arg[0] factory-reset - optional, default false.
    let factoryReset = false;
    if (args.length > 0) {
      factoryReset = true;
    }
    const guild = message.channel.guild;
    const emojiNames = ['bid', 'cancel', 'refresh'];
    const setup1 = Promise.all(guild.emojis.filter((emoji) => emojiNames.includes(emoji.name)).map(emoji => {
      return guild.deleteEmoji(emoji);
    })).then(() => {
      guild.createEmoji('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/microsoft/74/heavy-check-mark_2714.png', 'bid');
      guild.createEmoji('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/cross-mark_274c.png', 'cancel');
      guild.createEmoji('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/anticlockwise-downwards-and-upwards-open-circle-arrows_1f504.png', 'refresh');
    });
    let setup2 = Promise.resolve();
    if (factoryReset) {
      setup2 = dkp.setup(guild);
    }
    return Promise.all([setup1, setup2]);
  }
}