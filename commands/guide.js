const config = require('../config.json');
const fs = require('fs')
const path = require('path')

module.exports = {
	name: 'guide',
	description: 'prints out a guide message',
  args: false,
  officer: false,
  locks: [],
	execute(message, args) {
    const readme = fs.readFileSync(path.resolve(__dirname, '../README.md'), 'utf8');
    return message.author.send(readme);
  }
};
