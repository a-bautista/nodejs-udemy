const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  // solution 1: The entire file is read
  /*fs.readFile('test-file.txt', (err, data) => {
    if (err) console.log(err);
    res.end(data);
  }); */

  // solution 2: Use streams
  const readable = fs.createReadStream('testt-file.txt');
  readable.on('data', chunk => {
    res.write(chunk);
  });
  readable.on('end', () => {
    res.end(); // send the signal that you are done reading the file
  });
  readable.on('error', err => {
    console.log(err);
    res.statusCode = 500; // dev tools
    res.end('File not found');
  });
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening...');
});
