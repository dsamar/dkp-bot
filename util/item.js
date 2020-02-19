// use https://items.classicmaps.xyz/
//
// For example https://classic.wowhead.com/item=10399/blackened-defias-armor becomes https://items.classicmaps.xyz/17109.png.
const { reactionTagName, officerRole } = require("../config.json");
const { items } = require("../items.json");
const Discord = require("discord.js");
const sanitize = require("../util/sanitize.js");
const dkp = require("../util/dkp.js");
const tableview = require("../util/tableview.js");
const { table } = require("table");
const raid = require("../util/raid.js");
const loot = require("../util/loot.js");

function getField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  return field;
}

function getOrAddField(message, fieldName) {
  let field = message.fields.find(field => field.name === fieldName);
  if (!field) {
    message.addField(fieldName, "``````");
    field = message.fields.find(field => field.name === fieldName);
  }
  return field;
}

function getImage(item) {
  return "https://items.classicmaps.xyz/" + item.wowheadID + ".png";
}

function getItem(searchQuery) {
  return items.find(
    q => q.name.toLowerCase().search(searchQuery.toLowerCase()) != -1
  );
}

function stringToRollLine(string) {
  const dkpUser = [];
  const list = string.split("│").map(el => {
    el = el.replace("║", " ");
    return el.trim();
  });
  return list;
}

function parseRolls(text) {
  let all = text
    .split("\n")
    .slice(3, -1)
    .map(line => {
      return stringToRollLine(line);
    });
  return all;
}

function serializeRolls(all) {
  let searlizedList = all.slice();
  // Sort by value, descending.
  searlizedList.sort((a, b) => {
    return b[1] - a[1];
  });
  // add header
  searlizedList.unshift(["username", "roll (1-1000)"]);
  const config = {
    drawHorizontalLine: (index, size) => {
      return index === 0 || index === 1 || index === size;
    },
    border: {
      topBody: `-`,
      bottomBody: `-`,
      joinBody: `-`
    }
  };
  return table(searlizedList, config).trim();
}

function sortBids(all) {
  all.sort((a, b) => {
    if (a.value === b.value) {
      const a_attendance =
        (a.attendance.filter(c => c).length / a.attendance.length) * 100;
      const b_attendance =
        (b.attendance.filter(c => c).length / b.attendance.length) * 100;
      if (a_attendance === b_attendance) {
        if (a.class === b.class) {
          return a.username.localeCompare(b.username);
        }
        return a.class.localeCompare(b.class);
      }
      return b_attendance - a_attendance;
    }
    return b.value - a.value;
  });
  return all;
}

function winner(message, username, costOverride) {
  if (
    getOrAddField(new Discord.RichEmbed(message.embeds[0]), "locked").value ===
    "true"
  ) {
    throw new Error(
      "the item was already awarded, start a new bid with !bidstart"
    );
  }
  let cost = parseFloat(getOrAddField(message.embeds[0], "cost").value);
  if (costOverride !== null) {
    cost = parseFloat(costOverride);
  }
  return raid
    .getCurrentRaidRoster(message.channel.guild)
    .then(roster => {
      // Check that username is in the current roster
      if (!roster.includes(username) && username !== "guild-bank") {
        throw new Error(username + " not in the current roster: " + roster);
      }

      // Set winner on bid screen
      const receivedEmbed = message.embeds[0];
      const newEmbed = new Discord.RichEmbed(receivedEmbed);
      newEmbed.addField("winner", username);
      getOrAddField(newEmbed, "locked").value = "true";
      newEmbed.setColor("RED");
      const promise1 = message.edit(message.content, newEmbed);
      const promise2 = dkp.spendDkp(message.guild, roster, username, cost);
      const promise3 = message.clearReactions();
      return Promise.all([promise1, promise2, promise3]);
    })
    .then(() => {
      return loot.lootEntry(
        message.guild.id,
        message.embeds[0].title.replace(/\*/g, ""),
        cost,
        username
      );
    })
    .then(() => {
      return message.channel.send(
        username +
          " was awarded winning bid on **" +
          message.embeds[0].title +
          "** and charged: " +
          cost +
          " DKP\n" +
          sanitize.makeMessageLink(message)
      );
    });
}

function bidReact(message, dkpUsername, reactName, isOfficer) {
  const embed = message.embeds[0];
  const lockState = getField(embed, "locked");
  if (lockState && lockState.value == "true") {
    return Promise.resolve();
  }

  let cost = parseFloat(getField(embed, "cost").value);

  // Get user dkp value
  return dkp.all(message.guild).then(all => {
    const dkpUser = all.find(el => {
      return el.username === dkpUsername;
    });
    if (!dkpUser) {
      throw new Error("dkp user not found: " + dkpUsername);
    }
    let allBids = tableview.parse(message.content || "", []);
    allBids = allBids.filter(el => el.username !== "guild-bank");

    const newEmbed = new Discord.RichEmbed(embed);
    let randomRollsField = getOrAddField(newEmbed, "rolls");
    let allRolls = parseRolls(randomRollsField.value);

    // Winner should resolve all rolls, and remove the option to add new rolls or bids.
    // Trigger winner based on top random roll or top dkp.
    if (
      reactName === "winner" && isOfficer
    ) {
      // If there are DKP bids, those take priority.
      if (allBids.length > 0) {
        allBids = sortBids(allBids);
        let winnerUser = allBids[0].username;
        let costOverride = null;
        if (cost === 0) {
          costOverride = 50;
        }
        return winner(message, winnerUser, costOverride);
      }

      // Finalizing Random Rolls, if they exist
      // If there are no bids and no rolls, item gets vendored/sharded.
      if (allRolls.length === 0) {
        return winner(message, "guild-bank", 0);
      }

      allRolls.forEach(el => (el[1] = Math.round(Math.random() * 1000)));
      allRolls.sort((a, b) => {
        return b[1] - a[1];
      });

      randomRollsField.value = "```" + serializeRolls(allRolls) + "```";
      newEmbed.setColor("RED");
      return message.edit(message.content, newEmbed).then(() => {
        return winner(message, allRolls[0][0], null);
      });
    }

    // Logic for random dice rolling.
    if (reactName === "dice") {
      // this is a list of 0 == name 1 == numeric value
      // check if dkpUsername is already in list of rolls, dont add, return early.
      if (allRolls.find(el => el[0] == dkpUsername)) {
        return Promise.resolve();
      }

      // Add to random rolls, remove from bids.
      let roll = "TBD";
      allRolls.push([dkpUsername, roll]);
      allBids = allBids.filter(el => el.username !== dkpUser.username);
    }

    // Logic for bidding with DKP
    if (
      reactName === "bid" &&
      !allBids.find(el => el.username === dkpUser.username)
    ) {
      // Remove from rolls, add to bids.
      allRolls = allRolls.filter(el => el[0] !== dkpUsername);
      allBids.push(dkpUser);
    }

    // Cancel Logic
    if (reactName === "cancel") {
      allBids = allBids.filter(el => el.username !== dkpUser.username);
      allRolls = allRolls.filter(el => el[0] !== dkpUsername);
    }

    // Refresh all names from source
    allBids = allBids.map(el =>
      all.find(allEl => allEl.username === el.username)
    );

    // If no more dkp bids, remove the bid table.
    let bidContent = "```" + tableview.serializeRegular(allBids) + "```";
    if (allBids.length == 0) {
      bidContent = "";
      newEmbed.setColor("GRAY");
    } else {
      newEmbed.setColor("GREEN");
    }
    if (allRolls.length == 0) {
      randomRollsField.value = "``````";
    } else {
      randomRollsField.value = "```" + serializeRolls(allRolls) + "```";
    }
    return message.edit(bidContent, newEmbed);
  });
}

module.exports = {
  get: getItem,
  image: getImage,
  bidReact: bidReact,
  winner: winner
};
