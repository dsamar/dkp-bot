const Discord = require("discord.js");
const config = require("../config.json");
const sanitize = require("../util/sanitize.js");

function getField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  if (!field) {
    message.addField(fieldName, "<empty>");
    field = message.fields.find(field => field.name === fieldName);
  }
  return field;
}

module.exports = {
  name: "details",
  description: "sets raid details",
  usage: "<raid_id> <new_description",
  args: true,
  usage: "",
  officer: true,
  locks: ["raiddetails"],
  execute(message, args) {
    // Check the raid announce channel.
    const channel = message.guild.channels.find(
      ch => ch.name === config.raidAnnounceChannel
    );
    return channel.fetchMessage(args[0]).then(fetched => {
      const raidMessage = fetched.embeds[0];
      const newEmbed = new Discord.RichEmbed(raidMessage);
      const details = getField(newEmbed, "details");
      details.value = args.slice(1).join(" ");
      return Promise.all([
        fetched.edit("", newEmbed),
        message.channel.send(
          "updated raid signup message " + sanitize.makeMessageLink(fetched)
        )
      ]);
    });
  }
};
