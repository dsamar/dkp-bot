function sanitizeName(name) {
  const length = 12;
  name = name.length > length ? 
         name.substring(0, length): name;
  return name.toLowerCase();
}

module.exports = {
  name: sanitizeName,
  findUser: function(username, guild) {
    const members = guild.members;
    const guildUser = members.find((gm) => {
      return gm.user.username === username;
    });
    return guildUser;
  },
  getNickname: function(user,guild) {
    let dkpUsername = user.username;
    const members = guild.members;
    const guildUser = members.find((gm) => {
      return gm.user.id === user.id;
    });
    if (guildUser && guildUser.nickname) {
      dkpUsername = guildUser.nickname;
    }
    return sanitizeName(dkpUsername);
  },
  makeMessageLink: function(message) {
    return "http://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;
  }
}