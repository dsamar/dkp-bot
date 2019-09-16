**DKP Discord Bot**

Three channels need to be set up for the bot to work:
- `dkp-leaderboard` for displaying and persisting dkp values.
- `dkp-raidannounce` for raid announcements, currently pinned message is the current raid.
- `dkp-commands` for all bot commands.

Server role required:
- `officer` for member that can send dkp management commands to bot.

A good rule of thumb: set discord nickname to match your character name in game.
The bot will use your nickname for registering for raids and tracking DKP.
If you want to join the raid with an alt, change your server nickname to that character name before signing up to the raid.

**First time Setup**

- Run the command `!setup fresh` to make the necessary emojis and set up the leaderboard channel.

**Seting up a Raid**

- Schedule a raid with the `!schedule YYYY-MM-DD` command in advance.
  - Players can now sign up by clicking on the emote under the raid message.
- Close to the start of the raid, lock signups with the `!raidlock RAID_ID` command, and start in-game invites.
- Make sure the Discord raid roster message is up to date with who is actually in the in-game raid group by using the `!raidadd RAID_ID NAME` and `!raidremove RAID_ID NAME` commands.
- Run the `!raidstart RAID_ID` command to track attendance numbers.

**During a Raid**

- All commands during a raid will reference the current raid roster, which is set by the `!raidstart` command.
  - Edits to the raid roster are possible after `!raidstart` was called, and will update attendance numbers for members added.
- During a raid, when items drop, an officer can run the `!bidstart ITEM_QUERY_STRING` command to put an item up for sale.
  - For example: `!bidstart shadowstrike`
  - Players can react to the bid message if they wish to get the item. Each reaction will update the list of candidates, and their dkp tally.
- An officer picks the winner (by looking at the highest dkp, breaking ties as necessary) and runs the `!winner BID_ID NAME` command.
  - The winner gets the cost of the item subtracted, while the roster of the raid gets the cost added evenly.
  
## Installation

Scopes Needed:

- bot

Premissions Needed:

- Send Messages
- Manage Messages
- Embed Links
- Attach Files
- Read Message History
- Use External Emojis
- Add Reactions
- Manage Emojis
- View Channels

Linux Setup:

```
git clone https://github.com/dsamar/dkp-bot.git
cd dkp-bot
npm install
vim .env
  > BOT_TOKEN=<TOKEN>

sudo npm install -g forever
forever start server.js
crontab -u <USERNAME> -e
  > @reboot /usr/local/bin/forever start /home/<USERNAME>/dkp-bot/server.js
```

Update Commands:

```
cd dkp-bot
git reset --hard
git pull --rebase origin master
forever restartall

```