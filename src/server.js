var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var users = {};
var nicknames = [];

function updateNicknames() {
  io.sockets.emit('usernames', nicknames);
}

io.sockets.on("connection", function(socket) {

  socket.on('new user', function(data, callback) {

    socket.user = data;
    users[socket.user] = socket;
    nicknames.push(socket.user);
    socket.join(data.id);
    console.log('joining room  :  ', data);
    updateNicknames();

  })


  socket.on('send', function(data) {
    console.log('sending message  :   ', data);

    data["self"] = false
    io.sockets.in(data.to.id).emit('message', data);

    data["self"] = true
    io.sockets.in(data.from.id).emit('message', data);
  });



  socket.on('disconnect', function(data) {
    if (!socket.user) return null;
    nicknames.splice(nicknames.indexOf(socket.user), 1);
    updateNicknames();
  })

});


http.listen('3001', function() {
  console.log("We're connected");
});
