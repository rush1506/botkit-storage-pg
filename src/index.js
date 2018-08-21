const { Pool} = require('pg')

function escapeSpecialCharacters(string) {
  return string.replace(/'/g, "\\'");
}


function genInsertQuery(statement, data) {
  let query = statement;
  let key_query = '(';
  let value_query = '(';
  data.map((x) => {
      if (data.indexOf(x) === data.length - 1) {
          key_query = key_query + x.key + ')'; 
          value_query = value_query + x.value + ')';
      } else {
          key_query = key_query + x.key + ', '; 
          value_query = value_query + x.value + ', ';
      }
  });
  return query + key_query + " VALUES " + value_query + ";";
}


module.exports = function (config) {
  if (!config) {
    throw new Error('No config supplied!');
  }

  const pool = new Pool(config);  
  let connection = pool;

  


  var get = function (tableName, translator) {
    
    return function (id, callback) {
      connection.query('SELECT * from ' + tableName + ' where id = $1', [id], function (err, res) {
        if (err) {
          console.log(err);
        }
        callback(err, translator(res.rows[0]));
      });
    };
  };

  var saveUser = function (tableName) {
    return function (data, callback) {
      var dataToSave = [
        {key: 'id', value:  "'" + data.id + "'"},
        {key: 'access_token', value:  "'" + data.access_token + "'"},
        {key: 'scopes', value:  "'" + JSON.stringify(data.scopes) + "'"},
        {key: 'team_id', value:  "'" + data.team_id + "'"},
        {key: 'user_id', value:  "'" + data.user + "'"},
      ];
      save('INSERT into ' + tableName + ' ', dataToSave, callback);
    };
  };

  var saveTeam = function (tableName) {
    return function (data, callback) {
      var getTeam = get('botkit_team', dbToTeamJson);
      var team_name = escapeSpecialCharacters(data.name);
      var dataToSave = [
        {key: 'id', value:  "'" + data.id + "'"},
        {key: 'createdBy', value:  "'" + data.createdBy + "'"},
        {key: 'name', value:  "'" + team_name + "'"},
        {key: 'url', value:  "'" + data.url + "'"},
        {key: 'token', value:  "'" + data.token + "'"},
        {key: 'bot', value:  "'" + JSON.stringify(data.bot) + "'"},
      ];
      getTeam(dataToSave.id, function(err, teamData) {
        if (!teamData) {
          save('INSERT into ' + tableName + ' ', dataToSave, callback);
        } else {
          var updateSql = 'UPDATE botkit_team SET createdBy = $1, name = $2, url = $3, token = $4, bot = $5 WHERE id = $6';
          var updateSqlData = [dataToSave.createdBy, dataToSave.name, dataToSave.url, dataToSave.token, dataToSave.bot, dataToSave.id];

          save(updateSql, updateSqlData, callback);
        }
      });
    };
  };

  var saveChannel = function (tableName) {
    return function (data, callback) {
      var dataToSave = {id: data.id};
      var keys = Object.keys(data);
      var json = {};
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key != 'id') {
          json[key] = data[key];
        }
      }
      var dataToSave = [
        {key: 'id', value:  "'" + data.id + "'"},
        {key: 'json', value:  "'" + JSON.stringify(json) + "'"}];

      save('INSERT into ' + tableName + ' ', dataToSave, callback);
    };
  };

  var save = function (statement, dataToSave, callback) {
    let query = genInsertQuery(statement, dataToSave);
    console.log(query);
    connection.query(query, function (err, res) {
      if (err) {
        console.log(err);
      }
      callback(err);
    });
  };

  var all = function (tableName, translator) {
    return function (callback) {
      connection.query('SELECT * from ' + tableName, function (err, res) {
        var translatedData = [];
        for (var i = 0; i < res.rows.length; i++) {
          translatedData.push(translator(res.rows[i]))
        }
        callback(err, res.rows);
      });
    };
  };

  var dbToUserJson = function (userDataFromDB) {
    if (userDataFromDB) {
      userDataFromDB.scopes = JSON.parse(userDataFromDB.scopes);
    }
    return userDataFromDB;
  };

  var dbToTeamJson = function (teamDataFromDB) {
    if (teamDataFromDB) {
      teamDataFromDB.bot = JSON.parse(teamDataFromDB.bot);
    }
    return teamDataFromDB;
  };

  var dbToChannelJson = function (input) {
    var output = {id: input.id};
    var json = JSON.parse(input.json);
    var keys = Object.keys(json);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      output[key] = json[key];
    }
    return output;
  };

  const storage = {
    teams: {
      get: get('botkit_team', dbToTeamJson),
      save: saveTeam('botkit_team'),
      all: all('botkit_team', dbToTeamJson)
    },
    channels: {
      get: get('botkit_channel', dbToChannelJson),
      save: saveChannel('botkit_channel'),
      all: all('botkit_channel', dbToChannelJson)
    },
    users: {
      get: get('botkit_user', dbToUserJson),
      save: saveUser('botkit_user'),
      all: all('botkit_user', dbToUserJson)
    }
  };

  return storage;
};