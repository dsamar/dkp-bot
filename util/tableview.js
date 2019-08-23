const Discord = require('discord.js')
const {table} = require('table')

function userToString(dkpUser) {
  const attendancePercentage = dkpUser.attended / (dkpUser.attended + dkpUser.missed) * 100;
  return [ dkpUser.username, parseFloat(dkpUser.value).toFixed(2), attendancePercentage.toFixed(2) + " %", dkpUser.attended, dkpUser.missed];
}

function stringToUser(string) {
  const dkpUser = {};
  const list = string.split('│').map((el) => {
    el = el.replace('║',' ');
    return el.trim();
  });
  dkpUser.username = list[0];
  dkpUser.value = parseFloat(list[1]);
  dkpUser.attended = parseInt(list[3]);
  dkpUser.missed = parseInt(list[4]);
  return dkpUser;
}

function newUser(username) {
  const dkpUser = {};
  dkpUser.username = username;
  dkpUser.value = 0;
  dkpUser.attended = 0;
  dkpUser.missed = 0;
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
  data.unshift(['username', 'dkp', 'attendance', '#', 'X'])
  const config = {
    drawHorizontalLine: (index, size) => {
      return index === 0 || index === 1 || index === size;
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

module.exports = {
  parse: parseLeaderBoard,
  serializeEmbedded: serializeEmbedded,
  serializeRegular: serialize,
  removeDupes: removeDupes,
}