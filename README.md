# omegga-profanity

A plugin to prevent users from using certain profanities for Omegga. See below for information on how to configure profanities.

## Install

`omegga install gh:voximity/profanity`

## Usage

Configure the plugin to your liking.

### Configuration

Add to the `badWords` list to determine what words are considered "bad" (see below).

Add to the `terribleWords` list to determine what words are considered "terrible" (see below).

The `terribleBanReason` is the reason given for the permanent ban when a user speaks a terrible word.

`warns` determines how many warnings a user gets before they start getting temporarily banned for using bad words. Set to 0 to start temporarily banning them immediately.

`bans` determines how many temporary bans a user gets before they start getting banned permanently for using bad words after their `warns` have been exhausted. Set to 0 to permanently ban immediately after warnings have been exhausted.

`tempBanLength` is how long a temporary ban should be, in minutes.

`tempBanReason` is the reason given to the temporary ban due to use of a bad word.

`exemptRoles` is a list of roles that are exempt from the profanity filter.

### Word types

There are two types of words this plugin can handle, **bad words** and **terrible words**.

Bad words, intended to be used for casual swears, will initially trigger warnings (configurable), and eventually temporary bans. Finally, they will result in a permanent ban after the user exhausts all of their warnings and temporary bans.

Terrible words, intended for slurs and other unacceptable language, will immediately permanently ban the user. The plugin comes with some default slurs to help keep your game server civil, but you are welcome to add more or change them through the web UI.
