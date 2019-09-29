const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // read the variables from the config.env
const app = require('./app');

// see your dev variables
// console.log(app.get('env'));

//console.log(process.env);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    userCreateIndex: true,
    useFindAndModify: false
  })
  .then(connection => {
    console.log(connection.connections);
    console.log('DB connections successful!');
  });

// This is how you create objects from a new class
// An extra s will be added in Mongoose compass
/* const testTour = new Tour({
  name: 'The Forest Hiker Reloaded',
  rating: 4.7,
  price: 498
});

testTour
  .save()
  .then(document => {
    console.log(document);
  })
  .catch(error => {
    console.log('Error:');
    console.log(error.message);
  });
  */

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
