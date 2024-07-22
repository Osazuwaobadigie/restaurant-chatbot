const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let sessions = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  const sessionId = socket.id;
  sessions[sessionId] = { currentOrder: [], orderHistory: [] };

  socket.emit('bot-message', 'Welcome! Select an option: \n1: Place an order\n99: Checkout order\n98: See order history\n97: See current order\n0: Cancel order');

  socket.on('customer-message', (msg) => {
    handleCustomerMessage(sessionId, msg, socket);
  });
});

const handleCustomerMessage = (sessionId, msg, socket) => {
  const session = sessions[sessionId];

  switch (msg) {
    case '1':
      socket.emit('bot-message', 'Please select an item:\n1: Pizza\n2: Burger\n3: Pasta');
      break;
    case '99':
      if (session.currentOrder.length > 0) {
        session.orderHistory.push([...session.currentOrder]);
        session.currentOrder = [];
        socket.emit('bot-message', 'Order placed! Select an option: \n1: Place a new order\n98: See order history\n97: See current order\n0: Cancel order');
      } else {
        socket.emit('bot-message', 'No order to place. Select an option: \n1: Place an order\n98: See order history\n97: See current order\n0: Cancel order');
      }
      break;
    case '98':
      if (session.orderHistory.length > 0) {
        socket.emit('bot-message', `Order history: ${JSON.stringify(session.orderHistory)}`);
      } else {
        socket.emit('bot-message', 'No order history.');
      }
      break;
    case '97':
      if (session.currentOrder.length > 0) {
        socket.emit('bot-message', `Current order: ${JSON.stringify(session.currentOrder)}`);
      } else {
        socket.emit('bot-message', 'No current order.');
      }
      break;
    case '0':
      if (session.currentOrder.length > 0) {
        session.currentOrder = [];
        socket.emit('bot-message', 'Order canceled.');
      } else {
        socket.emit('bot-message', 'No order to cancel.');
      }
      break;
    case '1':
    case '2':
    case '3':
      const items = ['Pizza', 'Burger', 'Pasta'];
      session.currentOrder.push(items[parseInt(msg) - 1]);
      socket.emit('bot-message', `Added ${items[parseInt(msg) - 1]} to your order. Select more items or checkout (99).`);
      break;
    default:
      socket.emit('bot-message', 'Invalid option. Select an option: \n1: Place an order\n99: Checkout order\n98: See order history\n97: See current order\n0: Cancel order');
  }
};

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
