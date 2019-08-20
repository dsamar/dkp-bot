const Discord = require('discord.js')
const client = new Discord.Client()
const errors = require('./errors');
const raid = require('./raid');
const items = require('./items');
const emoji = require('./emoji');
const sheets = require('./sheets');

const DKP_CHANNEL_NAME = 'dkp-test';
const OFFICER_ROLE = 'officer';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

function handleRaidSignup(reaction, user) {
}

client.on('message', msg => {
  // Don't process our own messages.
  if (msg.author.id === client.user.id) {
    return;
  }
  if (msg.channel.name !== DKP_CHANNEL_NAME) {
    return;
  }
  // Cleanup msg text
  if (msg.author.id !== client.user.id) {
    msg.delete();
  }
  if (msg.content === '!raid start') {
    raid.start(msg);
    return;
  }
  if (msg.content === '!setup') {
    emoji.setup(msg.guild);
    msg.reply('server setup complete!');
    return;
  }
  if (msg.content.startsWith('!raid delete ')) {
    const commandTokens = msg.content.split(" ");
    if (commandTokens.length != 3 || isNaN(commandTokens[commandTokens.length - 1])) {
      errors.reply(msg, "raid id is invalid or not specified");
      return;
    }
    raid.delete(msg, commandTokens[commandTokens.length - 1], msg.channel);
    return;
  }
  if (msg.content.startsWith('!bid start ')) {
    const commandTokens = msg.content.split(" ");
    if (commandTokens.length != 3) {
      errors.reply(msg, "item name not specified");
      return;
    }
    items.startBids(msg, commandTokens[commandTokens.length - 1], msg.channel);
    return;
  }
  // Officer commands:
  // schedule raid <raidTitle> <description> <dd-mm-yyyy>
  // delete raid <raidId> -> only used if you made mistake
  // start raid <id> -> sets the raid specified as the current raid, all dkp commands will go to this raid.
  // raid add <memberName>
  // raid remove <memberName>
  // start bids <itemName> -> adds a window with bids as reactions, shows item image and a bidId
  // end bids <bidId> -> auto-calculates who won the bids, subtracts DKP and awards raid DKP.
  if (msg.author.id !== client.user.id) {
    errors.reply(msg, "invalid command");
  }
})

client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.message.channel.name !== DKP_CHANNEL_NAME) {
    return;
  }
  handleRaidSignup(reaction, user);
});

client.login(process.env.BOT_TOKEN);