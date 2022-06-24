const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const moment = require('moment');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./storages/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
  socket.on('join', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', wrapData('BOT', `Welcome to ${user.room}`));

    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', wrapData('BOT', `${user.username} has joined room`)
      );

    // Send users and room info
    io.to(user.room).emit('room-change', {room: user.room, users: getRoomUsers(user.room)});
    
    // Listen for chatMessage
    socket.on('on-chat', msg => {
      const user = getCurrentUser(socket.id);
  
      socket.broadcast.to(user.room).emit('message', wrapData(user.username, msg));
      socket.emit('my-message', wrapData(user.username, msg));
    });
  });


  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        wrapData('BOT', `${user.username} has left room`)
      );

      // Send users and room info
      io.to(user.room).emit('room-change', {room: user.room, users: getRoomUsers(user.room)});
    }
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function wrapData(username, msg) {
  return {
    username,
    msg,
    time: moment().format('HH:mm')
  };
}


