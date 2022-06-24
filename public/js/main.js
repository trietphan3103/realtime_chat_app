const chatForm = document.getElementById('chat-box-form');
const chatMessages = document.querySelector('.chat-box-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');

const socket = io();

// Emit to server that someone join chatroom
socket.emit('join', { username, room });

// Change list user and room's name
socket.on('room-change', ({ room, users }) => {
  // Change room's name
  roomName.innerText = room;

  // Change list user
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });

});

// Listen message from server
socket.on('message', (message) => {
  logMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Listen message from server
socket.on('my-message', (message) => {
  logMyMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Handle message on chat and send it to server
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let message = e.target.elements.msg.value;

  message = message.trim();

  if (!message) {
    return false;
  }

  // Emit message to server
  socket.emit('on-chat', message);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Log message to chat box
function logMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <p class="meta">${message.username}<span> - ${message.time}</span></p>
    <p class="text">${message.msg}</p>
  ` 
  document.querySelector('.chat-box-messages').appendChild(div);
  
}

// Log self message to chat box
function logMyMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add('myMessage');
  div.innerHTML = `
    <p class="meta">${message.username}<span> - ${message.time}</span></p>
    <p class="text">${message.msg}</p>
  ` 
  document.querySelector('.chat-box-messages').appendChild(div);
  
}

