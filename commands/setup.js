const dkp = require('../util/dkp.js')

module.exports = {
  name: 'setup',
	description: 'setup emoji used by the bot and, optionally initialize the leaderboard',
  usage: "[factory_reset]",
  args: false,
  officer: true,
  locks: ['dkp', 'raid'],
  execute: function(message, args) {
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
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/6/62/ClassIcon_warrior.png/26px-ClassIcon_warrior.png', 'warrior');
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/7/77/ClassIcon_warlock.png/26px-ClassIcon_warlock.png', 'warlock');
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/0/00/ClassIcon_shaman.png/26px-ClassIcon_shaman.png', 'shaman');
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/2/20/ClassIcon_rogue.png/26px-ClassIcon_rogue.png', 'rogue');
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/3/37/ClassIcon_priest.png/26px-ClassIcon_priest.png', 'priest');
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/c/c5/ClassIcon_paladin.png/26px-ClassIcon_paladin.png', 'paladin');
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/0/02/ClassIcon_mage.png/26px-ClassIcon_mage.png', 'mage');
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/a/a6/ClassIcon_hunter.png/26px-ClassIcon_hunter.png', 'hunter');
      guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/6/67/ClassIcon_druid.png/26px-ClassIcon_druid.png', 'druid');
            
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