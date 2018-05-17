
# botkit-storage-postgres

Postgres storage module for Botkit

## Install

Install with npm

```
npm install botkit-storage-pg --save
```

## Usage

If you're using botkit starter pack, you can do it in the `bot.js` file by adding config to it

For `Heroku` user with Uri:

```
if (isCustomStorage) {
  let dboptions = {
    connectionString: "Uri"
  };
  var storage = require('botkit-storage-pg')(dboptions);
  bot_options.storage = storage;
} else {
  console.log("Without a db, the bot will require reauthen when the server is restart");
  bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}
```

For user with normal option:

```
if (isCustomStorage) {
  let dboptions = {
    host: 'localhost',
    user: 'botkit',
    password: 'botkit',
    database: 'botkit',
    port: 'port'
  };
  var storage = require('botkit-storage-pg')(dboptions);
  bot_options.storage = storage;
} else {
  console.log("Without a db, the bot will require reauthen when the server is restart");
  bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}
```

If you're implementing botkit from scratch

For Uri:

```
var botkit_storage_pg = require('botkit-storage-pg');
var Botkit = require('botkit');

var controller = Botkit.slackbot({
  storage: botkit_storage_pg({
     connectionString: "Uri"
  })
});
```

For normal option:

```
var botkit_storage_pg = require('botkit-storage-pg');
var Botkit = require('botkit');

var controller = Botkit.slackbot({
  storage: botkit_storage_pg({
    host: 'localhost',
    user: 'botkit',
    password: 'botkit',
    database: 'botkit',
    port: 'port'
  })
});
```
### Requirements
* Node 8.0 or later
* Postgres 10.0 or later
