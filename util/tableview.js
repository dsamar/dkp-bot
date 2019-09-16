const Discord = require('discord.js')
const {table} = require('table')

function attendanceStringToList(str) {
  attendance = [];
  if (str)
  [...str].forEach(c => {
    // console.log(c);
    if (c == 'A') {
      attendance.push(true);
    } else {
      attendance.push(false);
    }
  });
  return attendance;
}

function attendanceListToString(list) {
  str = [];
  list.forEach(c => {
    if (c) {
      str.push('A');
    } else {
      str.push('_');
    }
  });
  return str.join("");
}

function userToString(dkpUser) {
  console.log(dkpUser.attendance);
  const attendancePercentage = dkpUser.attendance.filter(c => c).length / (dkpUser.attendance.length) * 100;
  return [ dkpUser.username, parseFloat(dkpUser.value).toFixed(2), attendancePercentage.toFixed(2) + " %", attendanceListToString(dkpUser.attendance)];
}

function stringToUser(string) {
  const dkpUser = {};
  const list = string.split('│').map((el) => {
    el = el.replace('║',' ');
    return el.trim();
  });
  dkpUser.username = list[0];
  dkpUser.value = parseFloat(list[1]);
  dkpUser.attendance = attendanceStringToList(list[3]);
  return dkpUser;
}

function newUser(username) {
  const dkpUser = {};
  dkpUser.username = username;
  dkpUser.value = 0;
  dkpUser.attendance = [];
  return dkpUser;
}

function parseLeaderBoard(text, roster) {
  let all = text.split("\n").slice(3, -1).map((line) => {
    return stringToUser(line);
  });
  all = all.filter((el) => {
    if (isNaN(el.value)) return false;
    return (el != null && el.username != "");
  });
  all = removeDupes(all);
  
  // Add any new users from roster.
  roster.forEach((user) => {
    if (!all.find((member) => { return member.username === user; })) {
      all.push(newUser(user));
    }
  });
  
  return all;
}

function serialize(all) {
  // Sort by value, descending.
  all.sort((a,b) => { return b.value-a.value; });
  // Turn back into a string.
  const data = all.map((member) => {
    return userToString(member);
  });
  // add header
  data.unshift(['username', 'dkp', 'attendance', 'history'])
  const config = {
    drawHorizontalLine: (index, size) => {
      return index === 0 || index === 1 || index === size;
    },
    border: {
      topBody: `-`,
      bottomBody: `-`,
      joinBody: `-`,
    },
    columns: {
      3: {
        width: 10,
        alignment: 'right'
      },
    }
  };
  return table(data, config).trim();
}

function serializeEmbedded(message, all) {
  const output = serialize(all);
  const updatedMessage = new Discord.RichEmbed(message.embeds[0]);
  updatedMessage.setDescription("```" + output + "```");
  updatedMessage.setTimestamp();
  return message.edit(updatedMessage);
}

function removeDupes(dkpUserList) {
  return dkpUserList
    .sort((a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0))
    .filter((item, pos, ary) => {
      return !pos || item != ary[pos - 1];
    });
}

function addAttendance(member) {
  member.attendance = member.attendance.slice(-7);
  member.attendance.push(true);
}

function markMissedAttendance(member) {
  member.attendance = member.attendance.slice(-7);
  member.attendance.push(false);
}

module.exports = {
  parse: parseLeaderBoard,
  serializeEmbedded: serializeEmbedded,
  serializeRegular: serialize,
  removeDupes: removeDupes,
  addAttendance: addAttendance,
  markMissedAttendance: markMissedAttendance,
}