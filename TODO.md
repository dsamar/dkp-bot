## OUTSTANDING ISSUES

- add commands to edit user's attendance numbers?
- don't allow a raid to be started more than once

- make usernames have first letter capitalized

- set the bot up on a cloud machine, and have it run 24/7 (auto-restart)
- import script from wowhead, to pull in all items
- command to add members to a bid
- somehow track attendance over last N raids.


## To scale this to a multi-server bot:

- Allow for guild-specific configuration values (config.js per guild)
  - take a look at enmap, looks to be a good choice for server-level configs.
  - https://gist.github.com/eslachance/5c539ccebde9fa76340fb5d54889aa22
  - even for sharding, the bot does not need to access other guild data.
  - move leaderboard storage to enmap.
- Allow guilds to set their own item prices
  - command for setting item price
  - items need tags, so you can assign prices by tag, making setup easier (eg: 't1-gloves' 't2-pants')

## OPTIONAL

- make command that lets you give points to on-time members by subtracting it from whole raid?
- add rest of classes to raid signups?
- make the raid screen look nicer, show stats of dps/melee/healers?

- command to end a raid !raidend, removing it from pinned
- allow for rolling to break ties, or just use in-game rolling
- command DEMO to populate a set of demo members to a raid
- command DEMO to award 20 random items to raid, as if members were winning it


