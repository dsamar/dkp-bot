# DKP Discord Bot

Pre-requisites:

Your discord nickname must match your character name in game. If you want to join the raid with a different character, change your nickname to that character name before signing up to the raid.

## Seting up a raid

- Schedule a raid with the !schedule command in advance.
  - Players can now sign up by clicking on the emote under the raid message.
- At the time of the raid, lock signups with the !raidlock command
- Invite everyone that signed up, use the !raidadd !raidremove command to adjust the roster of the raid.
- Run the !raidstart command to track attendance numbers.

## During a raid
- All commands during a raid will reference the current raid, which is set by the !raidstart command for the current roster.
- Edits to the raid roster are possible during a raid, but only by officers.
- During a raid, when items drop, an officer will run the !bidstart command to put an item up for sale
  - Players can now react to the bid message with interest, which adds lists their current dkp.
- An officer picks the winner (by looking at the highest dkp, breaking ties as necessary) and runs the !winner BID_ID NAME
- The winner gets the cost of the item subtracted, while the roster of the raid gets the cost added evenly.
- At the end of the raid, an officer can run the !raidend command to track attendance numbers once again.

Things left to do:
- add command for editing dkp of a member

- add command that allow adding/removing members from bid lists

- decay dkp command

- add rest of classes to raid signups

- make the raid screen look nicer, show stats of dps/melee/healers?

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

ATTENDANCE TODOS
- adding a member to a raid that already started should increment attendance for the member.
- Having an X on your leaderboard means you either missed the raid or were late. If you were late but are a new member, you will not get an X.
- add commands to edit user's attendance numbers.
- optional? add an on-time number?