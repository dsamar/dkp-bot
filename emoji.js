module.exports = {
  setup: function(guild) {
    guild.createEmoji('https://gamepedia.cursecdn.com/wowpedia/thumb/0/02/ClassIcon_mage.png/26px-ClassIcon_mage.png?version=7b14de74abd2f13836a3127a3044d06d', 'mage');
    guild.createEmoji('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/microsoft/74/heavy-check-mark_2714.png', 'bid');
  },
  get: function(guild, name) {
    return guild.emojis.find(em => em.name === name);
  }
}