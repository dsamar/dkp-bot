const fs = require('fs');
const Discord = require('discord.js')
const {prefix, commandChannel, raidAnnounceChannel, botCategory, officerRole, reactionTagName} = require('./config.json');

const client = new Discord.Client()
client.commands = new Discord.Collection();
client.reactions = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const reactionFiles = fs.readdirSync('./reactions').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

for (const file of reactionFiles) {
	const reaction = require(`./reactions/${file}`);
	client.reactions.set(reaction.name, reaction);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // Iterate all messages in the dkp command channel to put them in cache for reactions.
  client.guilds.forEach((guild) =>{
    guild.channels.find(ch => ch.name === commandChannel).fetchMessages().then((messages) => {});
    guild.channels.find(ch => ch.name === raidAnnounceChannel).fetchMessages().then((messages) => {});
  });
});

function handleMessage(message) {
  if (!message.content.startsWith(prefix)) {
    return Promise.resolve();
  }
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return Promise.resolve();

  // No action taken on messages from non-members and non-officers.
  if (command.officer) {
    if (!message.member || !message.member.roles.some(role => role.name === officerRole)) {
      return message.author.send("you need to have the " + officerRole + " role to send that command.");
    }
  }

  // Validate args.
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    return message.author.send(reply);
  }

  try {
    return command.execute(message, args)
      .catch((error) => {
      console.error(error);
        return message.author.send("ERROR: ```" + error.message + "```");
      });
  } catch (error) {
    console.error(error);
    return message.author.send("ERROR: ```" + error.message + "```");
  }
}

client.on('message', message => {
  if (message.channel.name !== commandChannel) return;
  if (message.author.bot) return;
  
  message.channel.startTyping();
  return handleMessage(message)
    .then(() => message.channel.stopTyping());
  
  // if there is too much command spam, consider removing messages after they are handled.
})

function reactionHandler(reaction, user) {
  // Check to see if this is one of the messages we have a reaction handler for
  if (reaction.message.embeds.length !== 1) return Promise.resolve();  
  const tag = reaction.message.embeds[0].fields.find(field => field.name === reactionTagName);
  if (!tag) return Promise.resolve();
  const reactionHandler = client.reactions.get(tag.value);
  if (!reactionHandler) return Promise.resolve();
  
  // Run the reaction handler
  try {
    return reactionHandler.execute(reaction, user).catch((error) => {
      console.error(error);
      return user.send("ERROR: ```" + error.message + "```");
    });
  } catch (error) {
    console.error(error);
		return user.send("ERROR: ```" + error.message + "```");
  }
}

client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.message.channel.parent.name !== botCategory || user.bot) {
    return;
  }
  
  reaction.message.channel.startTyping();
  return reactionHandler(reaction, user)
    .then(() => reaction.remove(user))
    .then(() => reaction.message.channel.stopTyping())
    
});

client.login(process.env.BOT_TOKEN);