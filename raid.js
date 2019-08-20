const errors = require('./errors');
const emoji = require('./emoji');
const DKP_CHANNEL_NAME = 'dkp-test';

function addRaidSignups (message) {
  message.react(emoji.get(message.guild, 'mage'));
}

module.exports = {
  schedule: function (contextMessage) {
  },
  delete: function(ctx, messageId, channel) {
    channel.fetchMessage(messageId).then(message => {
      console.log("deleting");
      message.delete();
    }).catch(error => {
      errors.reply(ctx, error.message)
    });
  },
  start: function(message) {
    const channel = message.guild.channels.find(ch => ch.name === DKP_CHANNEL_NAME);
    // Build the raid message with https://anidiots.guide/first-bot/using-embeds-in-messages
    let raidMessageId = null;
    let raidMessageContent = 'starting raid';
    channel.send(raidMessageContent)
      .then(raidMessage => {
      addRaidSignups(raidMessage)
      raidMessageId = raidMessage.id;
      raidMessage.edit(raidMessageContent + "\n raid id: " + raidMessageId);
    });
  }
};