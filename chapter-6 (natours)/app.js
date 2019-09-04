const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express(); // express is defined to create middlewares in node.js

// ----------------------------- Middleware sections -------------------------------------

app.use(express.json()); // middleware which is necessary for the POST requests
// In Express everything is a middleware

app.use((req, res, next) => {
  console.log('Hello from the Middleware!!! :D');
  next(); // this is necessary to continue on to the next request
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // a new method to the req was added
  next();
});

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // read the environment variables
  app.use(morgan('dev')); // login middleware
}

app.use(express.static(`${__dirname}/public`)); // this is necessary to make the rest of the files (html and css) available

// ----------------------------- End of middleware sections -------------------------------

// ----------------------------- Route Handlers -----------------------------------------

// ----------------------------- End of route handlers -----------------------------------

// ----------------------------- Routes --------------------------------------------------

// mount the routers
app.use('/api/v1/tours', tourRouter); // connect the new created middleware with the app file
app.use('/api/v1/users', userRouter); // the /api/v1/users is the parent URL

// --------------------------- Error handlers ------------------------------------------

// If a route is not found then handle the errror with the code from below
// This route should go at the end because it basically handles all the routes that do not match any defined URL

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //  status: 'fail',
  //  message: `Can't find ${req.originalUrl} on this server!`
  // });

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // when something is passed in next() then it automatically knows that an error occurred
}); // .all will handle all the http verbs

app.use(globalErrorHandler);

// --------------------------- End of routes -------------------------------------------

//-------------------------------- Start the server ----------------------------------------

//-------------------------- End of start the server ----------------------------------------

module.exports = app;
