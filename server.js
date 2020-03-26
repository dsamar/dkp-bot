const fs = require("fs");
const Discord = require("discord.js");
const {
  prefix,
  commandChannel,
  raidAnnounceChannel,
  leaderboardName,
  botCategory,
  officerRole,
  reactionTagName
} = require("./config.json");
const AsyncLock = require("async-lock");
const winston = require("winston");
const leveldb = require('./util/leveldb.js');
const lock = new AsyncLock();
require("dotenv").config();

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.reactions = new Discord.Collection();

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "log" })
  ],
  format: winston.format.printf(
    log => `[${log.level.toUpperCase()}] - ${log.message}`
  )
});

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));
const reactionFiles = fs
  .readdirSync("./reactions")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

for (const file of reactionFiles) {
  const reaction = require(`./reactions/${file}`);
  client.reactions.set(reaction.name, reaction);
}

client.on("ready", () => {
  logger.log("info", `Logged in as ${client.user.tag}!`);
  client.guilds.array().forEach((guild) => {
    leveldb.setup(guild);
  });
});

function handleError(error, user, message) {
  logger.log("error", error.stack);
  const errorContent = "ERROR: ```" + error.message + "\n" + error.stack + "```";
  // Officer-triggered error messages go in channel chat.
  if (message && message.member.roles.some(role => role.name === officerRole)) {
    return message.channel.send(errorContent);
  }
  // Otherwise send error to user directly.
  return user.send(errorContent);
}

function generateGuildLocks(locks, guild) {
  return locks.map(key => key + guild.id);
}

function handleMessage(message) {
  if (!message.content.startsWith(prefix)) {
    return Promise.resolve();
  }
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return Promise.resolve();

  // No action taken on messages from non-members and non-officers.
  if (command.officer) {
    if (
      !message.member ||
      !message.member.roles.some(role => role.name === officerRole)
    ) {
      return message.author.send(
        "you need to have the " + officerRole + " role to send that command."
      );
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
    // salt each set of locks with guild id.
    const commandLocks = generateGuildLocks(command.locks, message.guild);
    const runCommand = () => {
      try {
        return command.execute(message, args).catch(error => {
          return handleError(error, message.author, message);
        });
      } catch (error) {
        return handleError(error, message.author, message);
      }
    };
    logger.log("info", "acquire: " + commandLocks);
    return lock.acquire(commandLocks, runCommand).then(() => {
      logger.log("info", "release: " + commandLocks);
    }).then(() => {
      if (command.locks.includes("dkp")) {
        leveldb.refresh(message.guild);
      }
    });
  } catch (error) {
    return handleError(error, message.author, message);
  }
}

client.on("message", message => {
  if (message.type === "PINS_ADD") {
    return message.delete();
  }
  if (message.channel.name !== commandChannel) return;
  if (message.author.bot) return;

  message.channel.startTyping();
  return handleMessage(message)
    .then(() => message.channel.stopTyping())
    .then(() => {
      // Remove spam from non-officers.
      if (!message.member.roles.some(role => role.name === officerRole)) {
        message.delete();
      }
    });
});

function reactionHandler(reaction, user) {
  // Check to see if this is one of the messages we have a reaction handler for
  if (reaction.message.embeds.length !== 1) return Promise.resolve();
  const tag = reaction.message.embeds[0].fields.find(
    field => field.name === reactionTagName
  );
  if (!tag) return Promise.resolve();
  const reactionCommand = client.reactions.get(tag.value);
  if (!reactionCommand) return Promise.resolve();

  // Run the reaction handler
  try {
    // salt each set of locks with guild id.
    const commandLocks = generateGuildLocks(
      reactionCommand.locks,
      reaction.message.guild
    );
    const runCommand = () => {
      try {
        return reactionCommand.execute(reaction, user).catch(error => {
          return handleError(error, user, null);
        });
      } catch (error) {
        return handleError(error, user, null);
      }
    };
    logger.log("info", "acquire: " + commandLocks);
    return lock.acquire(commandLocks, runCommand).then(() => {
      logger.log("info", "release: " + commandLocks);
    });
  } catch (error) {
    return handleError(error, user, null);
  }
}

// Make sure we get all messageReactionAdd events. Not just the cached ones.
client.on("raw", packet => {
  // We don't want this to run on unrelated packets
  if (!["MESSAGE_REACTION_ADD"].includes(packet.t)) return;
  // Grab the channel to check the message from
  const channel = client.channels.get(packet.d.channel_id);
  // There's no need to emit if the message is cached, because the event will fire anyway for that
  if (channel.messages.has(packet.d.message_id)) return;
  // Since we have confirmed the message is not cached, let's fetch it
  channel.fetchMessage(packet.d.message_id).then(message => {
    // Emojis can have identifiers of name:id format, so we have to account for that case as well
    const emoji = packet.d.emoji.id
      ? `${packet.d.emoji.name}:${packet.d.emoji.id}`
      : packet.d.emoji.name;
    // This gives us the reaction we need to emit the event properly, in top of the message object
    const reaction = message.reactions.get(emoji);
    // Adds the currently reacting user to the reaction's users collection.
    if (reaction)
      reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
    // Check which type of event it is before emitting
    if (packet.t === "MESSAGE_REACTION_ADD") {
      client.emit(
        "messageReactionAdd",
        reaction,
        client.users.get(packet.d.user_id)
      );
    }
  });
});

client.on("messageReactionAdd", (reaction, user) => {
  if (
    reaction.message.channel.parent.name.toLowerCase() !==
      botCategory.toLowerCase() ||
    user.bot
  ) {
    return;
  }

  reaction.message.channel.startTyping();
  return reactionHandler(reaction, user)
    .then(() => reaction.remove(user))
    .then(() => reaction.message.channel.stopTyping());
});

client.login(process.env.BOT_TOKEN);
