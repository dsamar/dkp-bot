const Discord = require("discord.js");
const { reactionTagName, leaderboardName } = require("../config.json");
const messagedb = require("./messagedb.js");
const leveldb = require("./leveldb.js");
const attendance = require("./attendance.js");

const DATABASE_INTERFACE = leveldb;
const MESSAGE_LIMIT = 1500;

// This controls how much of a weight the attendance plays in dkp awarded.
// If MOD_WEIGHT is 0, attendance does not count for dkp awarded. Range is from 0 to 1.
const MOD_WEIGHT = 0.0;

function contentFromMessages(messages) {
  const messageArray = messages.sort((a, b) => a.id - b.id);
  return messageArray
    .filter(m => m.content !== "PLACEHOLDER")
    .map(m => {
      let str = m.content.trim();
      str = str.slice(3, str.length - 3);
      return str;
    })
    .join("\n");
}

function splitToMessages(channel, messages, serialized) {
  const messageArray = messages.sort((a, b) => a.id - b.id);
  const serializedLines = serialized.split("\n");
  const numMessages = Math.ceil(serialized.length / MESSAGE_LIMIT);
  const chunkSize = Math.floor(serializedLines.length / numMessages);

  const promiseList = [];
  for (let i = 0; i < numMessages; i++) {
    let currentContent = "";
    if (i != numMessages - 1) {
      currentContent =
        "```" +
        serializedLines.slice(i * chunkSize, (i + 1) * chunkSize).join("\n") +
        "```";
    } else {
      currentContent =
        "```" + serializedLines.slice(i * chunkSize).join("\n") + "```";
    }
    if (i > messageArray.length - 1) {
      promiseList.push(channel.send(currentContent).then(toPin => toPin.pin()));
    } else {
      promiseList.push(messageArray[i].edit(currentContent));
    }
  }
  // blank out rest of messages from numMessages -> messages.length();
  for (let i = numMessages + 1; i < messageArray.length; i++) {
    promiseList.push(messageArray[i].edit("PLACEHOLDER"));
  }
  return Promise.all(promiseList);
}



module.exports = {
  setup: function(guild) {
    const channel = guild.channels.find(ch => ch.name === leaderboardName);
    const content = "PLACEHOLDER";
    return channel.send(content).then(leaderboard => {
      return leaderboard.pin();
    });
  },
  all: function(guild) {
    return DATABASE_INTERFACE.getAll(guild, []);
  },
  query: function(guild, user) {
    // Returns a promise with the dkpUser object.
    return DATABASE_INTERFACE.getAll(guild, []).then(all => {
      return all.find(el => {
        return el.username === user;
      });
    });
  },
  spendDkp: function(guild, roster, username, value) {
    if (roster.length === 1) {
      throw new Error(
        "unable to spend DKP if there is only one member in the raid"
      );
    }
    if (roster.length === 0) {
      throw new Error(
        "you need to set up an active raid to start awarding dkp"
      );
    }
    if (isNaN(value))
      throw new Error(
        "unable to spend dkp, value to spend is not a number: " + value
      );
    return DATABASE_INTERFACE.getAll(guild, roster).then(all => {
      // calculate member attendanceModifier
      let attendanceTotal = 0.0;
      all.forEach(member => {
        // Only aggregate attendance total for members in roster.
        if (!roster.includes(member.username)) {
          return;
        }
        attendanceTotal += attendance.getAttPercent(member);
      });

      // decrement spend user, increment roster, IMPORTANT: spend user gets rewarded too.
      let runningTotal = 0;
      all.forEach(member => {
        const attendancePercentage = attendance.getAttPercent(member);
        const attendanceModifier = attendancePercentage / attendanceTotal;
        const baseShare = 1 / roster.length;
        const gainValue =
          value * ((attendanceModifier * MOD_WEIGHT) + baseShare * (1 - MOD_WEIGHT));

        if (username === member.username) {
          member.value -= value;
        }
        // Always increment value for members in roster, even if the member spent dkp on the item.
        if (roster.includes(member.username)) {
          member.value += gainValue;
          runningTotal += gainValue;
        }
      });

      // set attendance if this is a brand new member
      all.forEach(member => {
        if (member.attendance.length === 0) {
          member.attendance = [false];
        }
      });
      
      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  adjust: function(guild, username, value) {
    if (isNaN(value))
      throw new Error("unable to adjust dkp, value is not a number: " + value);
    return DATABASE_INTERFACE.getAll(guild, []).then(all => {
      if (!all.find(el => el.username === username)) {
        throw new Error("user not found: " + username);
      }

      // decrement spend user, increment everyone else on the leaderboard
      all.forEach(member => {
        if (username === member.username) {
          member.value += value;
        } else {
          member.value -= value / (all.length - 1);
        }
      });

      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  trade: function(guild, source, destination, value) {
    if (isNaN(value))
      throw new Error("unable to adjust dkp, value is not a number: " + value);
    return DATABASE_INTERFACE.getAll(guild, []).then(all => {
      if (all.length === 1 || all.length === 0) {
        throw new Error(
          "unable to trade DKP, leaderboard needs to be set up and have at least 2 members present"
        );
      }

      let source_user = all.find(el => el.username === source);
      let dest_user = all.find(el => el.username === destination);
      if (!source_user) {
        throw new Error("source user not found: " + source);
      }
      if (!dest_user) {
        throw new Error("source user not found: " + destination);
      }
      source_user.value -= value;
      dest_user.value += value;

      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  addRoster: function(guild, roster) {
    return DATABASE_INTERFACE.getAll(guild, roster).then(all => {
      all.forEach(dkpUser => {
        if (dkpUser.attendance.length === 0) {
          dkpUser.attendance = [false];
        }
      });
      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  dkpRemove: function(guild, username) {
    return DATABASE_INTERFACE.getAll(guild, []).then(all => {
      const removalUser = all.find(dkpUser => dkpUser.username === username);
      if (!removalUser) {
        throw new Error("user " + username + " not found");
      }

      // Give the value of the user we are removing to the guild-bank.
      all.find(dkpUser => dkpUser.username === "guild-bank").value +=
        removalUser.value;

      all = all.filter(dkpUser => dkpUser.username !== username);
      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  incrementAttendance: function(guild, roster) {
    return DATABASE_INTERFACE.getAll(guild, roster).then(all => {
      // Apply valueFn
      all.forEach(member => {
        if (roster.includes(member.username)) {
          attendance.addAttendance(member);
        } else {
          attendance.markMissedAttendance(member);
        }
      });

      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  updateDkp: function(guild, roster, valueFn) {
    return DATABASE_INTERFACE.getAll(guild, roster).then(all => {
      // Apply valueFn
      all.forEach(member => {
        if (roster.includes(member.username)) {
          member.value = valueFn(member.value);
        }
      });

      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  importDkp: function(guild, importMessages) {
    return DATABASE_INTERFACE.importDkp(guild, importMessages);
  },
  setAttendance: function(guild, username, history) {
    return DATABASE_INTERFACE.getAll(guild, [username]).then(all => {
      // Set the history.
      all.forEach(member => {
        if (username === member.username) {
          attendance.setAttendance(member, history);
        }
      });

      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  setClass: function(guild, username, className) {
    return DATABASE_INTERFACE.getAll(guild, [username]).then(all => {
      // Set the className.
      all.forEach(member => {
        if (username === member.username) {
          member.class = className;
        }
      });

      return DATABASE_INTERFACE.writeAll(guild, all);
    });
  },
  getallsum: function(guild) {
    return DATABASE_INTERFACE.getAll(guild, []).then(all => {
      let sum = 0;
      // decrement spend user, increment everyone else on the leaderboard
      all.forEach(member => {
        sum += member.value;
      });
      return sum;
    });
  }
};
