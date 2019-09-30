const Discord = require('discord.js')
const {table} = require('table')

const NUM_RAIDS_ATTENDANCE = 14;

function attendanceStringToList(str) {
  let attendance = [];
  if (str)
  [...str].forEach(c => {
    if (c == 'A') {
      attendance.push(true);
    } else {
      attendance.push(false);
    }
  });
  return attendance;
}

function attendanceListToString(list) {
  let str = [];
  list.forEach(c => {
    if (c) {
      str.push('A');
    } else {
      str.push('.');
    }
  });
  return str.join("");
}

function userToString(dkpUser) {
  const attendancePercentage = dkpUser.attendance.filter(c => c).length / (dkpUser.attendance.length) * 100;
  return [dkpUser.username, 
          parseFloat(dkpUser.value).toFixed(2), 
          attendancePercentage.toFixed(0) + "%",
          attendanceListToString(dkpUser.attendance),
          dkpUser.class];
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
  dkpUser.class = list[4] || '?';
  return dkpUser;
}

function newUser(username) {
  const dkpUser = {};
  dkpUser.username = username;
  dkpUser.value = 0;
  dkpUser.attendance = [];
  dkpUser.class = '?';
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
  roster.push("guild-bank");
  roster.forEach((user) => {
    if (!all.find((member) => { return member.username === user; })) {
      all.push(newUser(user));
    }
  });
  
  return all;
}

function serialize(all) {
  // Sort by value, descending.
  all.sort((a,b) => {
    if (a.value === b.value) {
      const a_attendance = a.attendance.filter(c => c).length / (a.attendance.length) * 100;
      const b_attendance = b.attendance.filter(c => c).length / (b.attendance.length) * 100;
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
  // Turn back into a string.
  const data = all.map((member) => {
    return userToString(member);
  });
  // add header
  data.unshift(['username', 'dkp', 'atn%', 'history', 'class'])
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
      1: {
        alignment: 'right'
      },
      2: {
        alignment: 'right'
      },
      3: {
        width: NUM_RAIDS_ATTENDANCE - 1,
        alignment: 'right'
      },
    }
  };
  return table(data, config).trim();
}

function serializeEmbedded(message, all) {
  const output = serialize(all);
  return message.edit("```" + output + "```");
}

function removeDupes(dkpUserList) {
  return dkpUserList
    .sort((a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0))
    .filter((item, pos, ary) => {
      return !pos || item != ary[pos - 1];
    });
}

function addAttendance(member) {
  member.attendance = member.attendance.slice(-(NUM_RAIDS_ATTENDANCE-1));
  member.attendance.push(true);
}

function markMissedAttendance(member) {
  member.attendance = member.attendance.slice(-(NUM_RAIDS_ATTENDANCE-1));
  member.attendance.push(false);
}

function setAttendance(member, history) {
  member.attendance = attendanceStringToList(history);
  member.attendance = member.attendance.slice(-(NUM_RAIDS_ATTENDANCE-1));
}

module.exports = {
  parse: parseLeaderBoard,
  serializeEmbedded: serializeEmbedded,
  serializeRegular: serialize,
  removeDupes: removeDupes,
  addAttendance: addAttendance,
  markMissedAttendance: markMissedAttendance,
  setAttendance: setAttendance,
}