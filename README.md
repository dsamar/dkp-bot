# DKP Discord Bot

Pre-requisites:

Three channels need to be set up for the bot to work:
- `dkp-leaderboard`
- `dkp-raidannounce`
- `dkp-commands`

Your discord nickname must match your character name in game. If you want to join the raid with a different character, change your server nickname to that character name before signing up to the raid.

## Seting up a Raid

- Schedule a raid with the `!schedule YYYY-MM-DD` command in advance.
  - Players can now sign up by clicking on the emote under the raid message.
- Close to the start of the raid, lock signups with the `!raidlock RAID_ID` command, and start in-game invites.
- Make sure the Discord raid roster message is up to date with who is actually in the in-game raid group by using the `!raidadd RAID_ID NAME` and `!raidremove RAID_ID NAME` commands.
- Run the `!raidstart RAID_ID` command to track attendance numbers.

## During a Raid
- All commands during a raid will reference the current raid roster, which is set by the `!raidstart` command.
- Edits to the raid roster are possible after `!raidstart` was called, and will update attendance numbers for members added.
- During a raid, when items drop, an officer can run the `!bidstart ITEM_QUERY_STRING` command to put an item up for sale.
  - For example: `!bidstart shadowstrike`
  - Players can now react to the bid message if they wish to get the item. Each reaction will update the list of candidates, and their dkp tally.
- An officer picks the winner (by looking at the highest dkp, breaking ties as necessary) and runs the `!winner BID_ID NAME` command.
  - The winner gets the cost of the item subtracted, while the roster of the raid gets the cost added evenly.
- At the end of the raid, an officer can run the `!raidend` command to track attendance numbers once again.

## OUTSTANDING ISSUES

- add command for editing dkp of a member -> we dont want this

- show member dkp on bid window? maybe not necessary yet
- allow for rolling to break ties, or just use in-game rolling

- decay dkp command

- add rest of classes to raid signups

- make the raid screen look nicer, show stats of dps/melee/healers?
- make a separate channel for dkp raid screens
- make sure all replies and error messages of the bot are sent to the main dkp bot channel

- after raid is started, remove emoji reactions and don't allow users to register without officer command.

- backup/restore function for leaderboard

- add an audit log for dkp value changes (separate channel?)

- all commands need to have a reply on errors. on success, something visible needs to happen.

- all commands should validate input, and handle errors from sub-promises

- help command

- setup should not delete all emojis
- setup needs to have a first run mode, should not wipe DKP.

- invalid commands need to be deleted?
- command to cleanup chat of commands that are not relevant 

- remove add dkp command (this is 0 sum, don't let officers input random values)
- optional? make command that lets you give points to on-time members by subtracting it from whole raid?

## ATTENDANCE TODOS
- adding a member to a raid that already started should increment attendance for the member.
- Having an X on your leaderboard means you either missed the raid or were late. If you were late but are a new member, you will not get an X.
- add commands to edit user's attendance numbers.
- optional? add an on-time number?