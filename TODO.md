## OUTSTANDING ISSUES

- make usernames have first letter capitalized

## To scale this to a multi-server bot:

- Allow for guild-specific configuration values (config.js per guild)
  - take a look at enmap, looks to be a good choice for server-level configs.
  - https://gist.github.com/eslachance/5c539ccebde9fa76340fb5d54889aa22
  - even for sharding, the bot does not need to access other guild data.
  - move leaderboard storage to enmap.
- Allow guilds to set their own item prices
  - command for setting item price

## OPTIONAL

- command to end a raid !raidend, removing it from pinned
- allow for rolling to break ties, or just use in-game rolling
- command DEMO to populate a set of demo members to a raid
- command DEMO to award 20 random items to raid, as if members were winning it


