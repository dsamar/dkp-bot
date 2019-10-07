const Discord = require('discord.js');
const dkp = require("../util/dkp.js");
const tableview = require("../util/tableview.js");
const config = require('../config.json');

module.exports = {
	name: 'dkplist',
	description: "lists the dkp values of all members of a particular class",
  usage: '<class_name>',
  args: true,
  officer: false,
  locks: [],
  aliases: ['dkplist'],
	execute(message, args) {
    const className = args[0];
    return dkp.all(message.guild).then((dkpList) => {
      const classList = dkpList.filter((user) => {
        return user.class === className;
      });
      if (classList.length == 0) {
        return message.author.send("No results found for class: " + className);
      }
      return message.author.send("```" + tableview.serializeRegular(classList) + "```");
    });    
  }
};
