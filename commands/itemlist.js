const config = require('../config.json');

module.exports = {
	name: 'itemlist',
	description: 'lists all items in database, and their cost',
  args: false,
  officer: false,
  locks: [],
	execute(message, args) {
    const itemList = config.items.map((el) => {
      return "**" + el.name + "** | " + el.cost;
    }).join("\n");
    return message.author.send(itemList);
  }
};
