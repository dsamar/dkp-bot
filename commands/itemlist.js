const config = require('../config.json');
const {items} = require('../items.json');

module.exports = {
	name: 'itemlist',
	description: 'lists all items in database, and their cost',
  args: false,
  officer: false,
  locks: [],
	execute(message, args) {
    const itemList = items.map((el) => {
      return "**" + el.name + "** | " + el.cost;
    }).join("\n");
    return message.author.send(itemList);
  }
};
