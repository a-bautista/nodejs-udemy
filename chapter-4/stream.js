const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  // solution 1: The entire file is read
  // drawback: Reading and displaying the entire file is not the best practice.
  /*fs.readFile('test-file.txt', (err, data) => {
    if (err) console.log(err);
    res.end(data);
  }); */

  // solution 2: Use streams
  // drawback: The file is read fast and the network or response cannot send each chunk that fast (backpressure).
  /*const readable = fs.createReadStream('test-file.txt');
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
  });*/

  //solution 3:
  const readable = fs.createReadStream('test-file.txt');
  readable.pipe(res);
  // readableSource.pipe(writeable)
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening...');
});
