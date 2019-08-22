const config = require('../config.json');
const fs = require('fs')
const path = require('path')

module.exports = {
	name: 'help',
	description: 'Prints out a help message.',
  args: false,
  usage: '',
  officer: false,
  locks: [],
	execute(message, args) {
    const readme = fs.readFileSync(path.resolve(__dirname, '../README.md'), 'utf8');
    return message.author.send(readme);
  }
};
