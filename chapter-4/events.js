// modules
const EventEmitter = require('events');
const http = require('http');

//const myEmitter = new EventEmitter();
// Make the class Sales to inherit from the EventEmitter
class Sales extends EventEmitter {
  constructor() {
    super(); // inherit from the parent class
  }
}

const myEmitter = new Sales();

// this is an event listener for the myEmitter event
myEmitter.on('newSale', () => {
  console.log('There was a new sale!');
});

myEmitter.on('newSale', () => {
  console.log('Alejandro was here.');
});

//this is a callback function that receives a paramter and then it prints it in display
myEmitter.on('newSale', stock => {
  console.log(`There are now ${stock} items left in stock.`);
});

// this is the event emitter
//myEmitter.emit('newSale'); // this function is displayed 3 times
myEmitter.emit('newSale', 10); // this function is displayed 3 times

///////////////////

// create the server
const server = http.createServer();

// server listening to an event
server.on('request', (req, res) => {
  console.log('Request received!');
  // res sends the results into the browser
  res.end('Request received');
});

// server listening to an event
server.on('request', (req, res) => {
  console.log('Another request');
});

server.on('close', () => {
  console.log('Server closed');
});

// set up the server into a port
server.listen(8000, '127.0.0.1', () => {
  console.log('Waiting for requests...');
});
