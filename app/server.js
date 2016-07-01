var
  server = require('http').createServer(),
  express = require('express'),
  app = express();
var 
  WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({ server: server });  

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
    else if (msgAr[0] == 'bot' && msgAr.length == 3) {
      var cmdData = {
        "command": msgAr[1],
        "data": msgAr[2], 
      };
      var bot = new Bot(cmdData);
      bot.generateHash();
      broadcast(JSON.stringify({data: bot.hash}));
    }
    else {
      broadcast(JSON.stringify({data: message}));
    }
  });

  ws.on('close', function () {
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

server.on('request', app);
server.listen(app.get('port'), function () { console.log('Listening on ' + server.address().port) });
