var
  server = require('http').createServer(),
  express = require('express'),
  app = express();
var 
  WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({ server: server });
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('db.sqlite3');

var Bot = require("../app/bot.js");

//Websocket接続を保存しておく
var connections = [];

app.set('port', (process.env.PORT || 5000));
app.use(express.static('app')); 
 
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

wss.on('connection', function(ws) {

  console.log('connection start');

  //配列にWebSocket接続を保存
  connections.push(ws);

  ws.on('message', function(message) {
    console.log('message:', message);
    var msgAr = message.split(' ');
    // bot ping
    if (msgAr[0] == 'bot' && msgAr[1] == 'ping' && msgAr.length == 2) {
      broadcast(JSON.stringify({data: 'pong'}));
    }
    // bot original 
    if (msgAr[0] == 'bot' && msgAr[1] == 'takaken' && msgAr.length == 2) {
      broadcast(JSON.stringify({data: 'かっこいい'}));
    }
    // bot todo
    else if (msgAr[0] == 'bot' && msgAr[1] == 'todo' && msgAr.length >= 3) {
      msgAr.splice(0, 2);
      console.log(msgAr);
      botTodo(msgAr);
    } 
    // bot command
    else if (msgAr[0] == 'bot' && msgAr[1] == 'command' && msgAr.length == 3) {
      var cmdData = {
        "command": msgAr[1],
        "data": msgAr[2], 
      };
      var bot = new Bot(cmdData);
      bot.generateHash();
      broadcast(JSON.stringify({data: bot.hash}));
    }
    // others echo message
    else {
      broadcast(JSON.stringify({data: message}));
    }
  });

  ws.on('close', function () {
    db.close();
    connections = connections.filter(function (conn, i) {
      return (conn === ws) ? false : true;
    });
  });

});

//ブロードキャストを行う
function broadcast(message) {
  connections.forEach(function (con, i) {
    con.send(message);
  });
};

// todoの処理
function botTodo(args) {
  var nae = '', content = '', stmt = '', result ='';
  var list = [];
  if (args[0] == 'add' && args.length >= 3) {
    name = args[1];
    args.splice(0,2);
    content = args.join(' '); 
    console.log(name);
    console.log(content);
    db.serialize(function () {
      stmt = db.prepare("INSERT INTO todo(name, content) VALUES (?, ?)");
      stmt.run(name, content);
      stmt.finalize();
      broadcast(JSON.stringify({data: 'todo added'}));
    });
  }
  else if (args[0] == 'delete' && args.length == 2) {
    db.serialize(function () {
      db.run("DELETE FROM todo WHERE name = ?", args[1]);
      broadcast(JSON.stringify({data: 'todo deleted'}));
    });
  }
  else if (args[0] == 'list' && args.length == 1) {
    db.serialize(function () {
      db.each(
        "SELECT * FROM todo",
        function(err, row) {
          console.log(row);
          console.log(row.name);
          console.log(row.content);
          list.push(row.name + ' ' + row.content);
          console.log(list);
        },
        function() {
          if (list == null) {
            broadcast(JSON.stringify({data: 'todo empty'}));
          }
          else {
            result = list.join('\n');
            console.log(result);
            broadcast(JSON.stringify({data: result}));
          }
        }
      );
    });
  } 
}

server.on('request', app);
server.listen(app.get('port'), function () { console.log('Listening on ' + server.address().port) });
