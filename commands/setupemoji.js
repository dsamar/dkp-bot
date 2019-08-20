module.exports = {
  name: 'setupemoji',
	description: 'Commands for managing emojis',
  args: false,
  aliases: ['setup', 'emoji'],
  execute: function(message) {
    const guild = message.channel.guild;
    guild.emojis.forEach(emoji => {
      guild.deleteEmoji(emoji);
    });
    message.channel.guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/0/02/ClassIcon_mage.png/26px-ClassIcon_mage.png?version=7b14de74abd2f13836a3127a3044d06d', 'mage');
    message.channel.guild.createEmoji('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/microsoft/74/heavy-check-mark_2714.png', 'bid');
    message.channel.guild.createEmoji('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/cross-mark_274c.png', 'cancel');
  }
}