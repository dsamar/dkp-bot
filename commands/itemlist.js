const config = require('../config.json');

module.exports = {
	name: 'itemlist',
	description: 'Lists all items in database, and their cost.',
  args: false,
  usage: '',
  officer: false,
	execute(message, args) {
    const itemList = config.items.map((el) => {
      return "**" + el.name + "** | " + el.cost;
    }).join("\n");
    return message.author.send(itemList);
  }
};
