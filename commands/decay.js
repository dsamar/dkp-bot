const raid = require("../util/raid.js");
const dkp = require("../util/dkp.js");
const sanitize = require("../util/sanitize.js");

module.exports = {
  name: "decay",
  description:
    "decay the dkp of all members by the percentage provided. eg: !decay 2.5 will decay the leaderboard by 2.5%",
  usage: "<numeric_value>",
  args: true,
  officer: true,
  locks: ["dkp"],
  execute(message, args) {
    // args[0] == decay multiplier
    return dkp.all(message.channel.guild).then(all => {
      const roster = all.map(el => el.username);
      const number = parseFloat(args[0]);
      if (isNaN(number)) {
        throw new Error("invalid argument: " + args[0]);
      }
      const decayMultiplier = 1.0 - number / 100.0;
      const valueFn = prev => {
        return prev * decayMultiplier;
      };
      return dkp.updateDkp(message.guild, roster, valueFn).then(() => {
        message.channel.send(
          "decayed leaderboard dkp values by: " + args[0] + "%"
        );
      });
    });
  }
};
