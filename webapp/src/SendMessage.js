const io = require('socket.io-client');

const socket = io('https://chat2.bags.fm/v1', {
  query: { token: 'YOUR_ACCESS_TOKEN_HERE' },
  extraHeaders: {
    Cookie: 'jsessionid=1234'  // Use a valid session ID if required
  },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected to chat server');
  
  // Send a message
  socket.emit('chat_message', {
    chatId: 'TARGET_CHAT_ID',
    message: {
      text: 'Hello from BagsIntern!',
      user: {
        _id: 'bagsintern_id',
        name: 'BagsIntern',
        avatar: 'https://avatar-url-for-bagsintern',
        isOg: false
      }
    }
  });
});

socket.on('error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// Keep the script running for a short while to allow the message to be sent
setTimeout(() => {
  socket.disconnect();
  console.log('Disconnected after timeout');
}, 5000);