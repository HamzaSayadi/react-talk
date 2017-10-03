var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};
var nicknames = [];
io.sockets.on("connection" , function(socket){
  console.log("somone connected");
  updateNicknames();
  socket.on('new user' , function(data , callback){


        socket.user = data ;
        users[socket.user] = socket;
        nicknames.push(socket.user);
        console.log(nicknames);
        updateNicknames();

  })

  function updateNicknames() {
    io.sockets.emit('usernames' , nicknames);
  }
  socket.on("private-message" , function(msg){
    console.log("sending private msg to "+msg.to );
    var socket = users[msg.to];
    socket.emit("receive-private" ,{ user : msg.from , to : msg.to ,  body : msg.body});
    users[msg.from].emit("receive-private" ,{ user : msg.from ,to : msg.to , body : msg.body});
  });
  socket.on("new-message" , function(msg){
    console.log(msg.body.substr(0,1));
    if (msg.body.substr(0,1) == 'w') {
      console.log("whispering");
      var msgn;
      msgn = msg.body.substr(1);
      var ind = msgn.indexOf(' ');
      console.log(ind);
      if (ind !== -1){
        var name = msgn.substring(0, ind);
        var msgn = msgn.substring(ind + 1);
        console.log(name);
        if (name in nicknames) {
            users[name].emit('whisper',{user : msg.name , body : msgn});
        }
      }
    }
    io.emit("receive-msg" , msg);
  })
  socket.on("test", function () {
    console.log("mounted");
  });
  socket.on('disconnect' , function (data) {
    if (!socket.user) return null;
    console.log("somone disconnected");
    nicknames.splice(nicknames.indexOf(socket.user) , 1);
    updateNicknames();
  })
});


http.listen('3001' , function() {
  console.log("We're connected");
});
