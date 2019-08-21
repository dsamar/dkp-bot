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

client.on('message', message => {
  if (message.channel.name !== commandChannel) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) {
    message.delete();
    return;
  }
  const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;
  
  // No action taken on messages from non-members and non-officers.
  if (!message.member || !message.member.roles.some(role => role.name === officerRole)) {
    message.reply("you need to be an " + officerRole + " to send commands here.");
    return;
  }
  
  // Validate args.
  if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.reply(reply);
	}
  
  try {
		command.execute(message, args).catch((error) => {
      return message.reply("ERROR: ```" + error.message + "```");
    });
	} catch (error) {
		message.reply("ERROR: ```" + error.message + "```");
	}
})

client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.message.channel.parent.name !== botCategory || user.bot) {
    return;
  }
  
  // Check to see if this is one of the messages we have a reaction handler for
  if (reaction.message.embeds.length !== 1) return;  
  const tag = reaction.message.embeds[0].fields.find(field => field.name === reactionTagName);
  if (!tag) return;
  const reactionHandler = client.reactions.get(tag.value);
  if (!reactionHandler) return;
  
  // Run the reaction handler
  try {
    reactionHandler.execute(reaction, user).catch((error) => {
      reaction.message.reply("ERROR: ```" + error.message + "```");
    });
  } catch (error) {
		reaction.message.reply("ERROR: ```" + error.message + "```");
  }
});

client.login(process.env.BOT_TOKEN);