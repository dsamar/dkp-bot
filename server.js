const fs = require('fs');
const Discord = require('discord.js')
const {prefix, channelName, officerRole, reactionTagName} = require('./config.json');

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
  // Iterate all messages in the dkp-bot channel to put them in cache for reactions.
  client.guilds.forEach((guild) =>{
    const channel = guild.channels.find(ch => ch.name === channelName);
    channel.fetchMessages().then((messages) => {
      // messages.forEach(msg => msg.delete());      
    });
  });
});

client.on('message', message => {
  if (message.channel.name !== channelName) return;
  if (!message.content.startsWith(prefix) || message.author.bot) return;
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
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
})

client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.message.channel.name !== channelName || user.bot) {
    return;
  }
  reaction.remove(user);
  if (reaction.message.embeds.length !== 1) return;  
  const tag = reaction.message.embeds[0].fields.find(field => field.name === reactionTagName);
  if (!tag) return;
  const reactionHandler = client.reactions.get(tag.value);
  if (!reactionHandler) return;
  try {
    reactionHandler.execute(reaction, user);
  } catch (error) {
    console.error(error);
		reaction.message.reply('there was an error trying to execute the reaction handler!');
  }
});

client.login(process.env.BOT_TOKEN);