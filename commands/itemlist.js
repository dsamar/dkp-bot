const config = require('../config.json');
const {items} = require('../items.json');

const MESSAGE_LIMIT = 2000;

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
    const serializedLines = itemList.split("\n");
    const numMessages = Math.ceil(itemList.length / MESSAGE_LIMIT);
    const chunkSize = Math.floor(serializedLines.length / numMessages);
    const promises = [];
    for (let i = 0; i < numMessages; i++) {
      let currentContent = "";
      if (i != numMessages-1) {
        currentContent = serializedLines.slice(i*chunkSize, (i+1)*chunkSize).join("\n");
      } else {
        currentContent = serializedLines.slice(i*chunkSize).join("\n");
      }
      promises.push(message.channel.send(currentContent));
    }
    return Promise.all(promises);
  }
};
