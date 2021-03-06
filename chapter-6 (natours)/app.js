const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const app = express(); // express is defined to create middlewares in node.js

app.set('view engine', 'pug'); // pug template setup
app.set('views', path.join(__dirname, 'views'));

// serving static files
// app.use(express.static(`${__dirname}/public`)); // this is necessary to make the rest of the files (html and css) available
app.use(express.static(path.join(__dirname, 'public')));

// middleware which is necessary for the POST requests
// In Express everything is a middleware

// ----------------------------- Middleware sections -------------------------------------

// security http headers
app.use(helmet());

/*app.use((req, res, next) => {
  console.log('Hello from the Middleware!!! :D');
  next(); // this is necessary to continue on to the next request
});*/

// Development logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // read the environment variables
  app.use(morgan('dev')); // login middleware
}

// limit the number of requests for the API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body (packages with a weight over 10kb will not be served)
app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Parse the data from the cookie
app.use(cookieParser());

// Data sanitization against NoSQL injections
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({ whitelist: ['duration', 'price', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty'] }));

app.use(compression()); //compress the routes

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // a new method to the req was added
  console.log(req.cookies);
  next();
});

// ----------------------------- End of middleware sections -------------------------------

// ----------------------------- Route Handlers -----------------------------------------

// ----------------------------- End of route handlers -----------------------------------

// ----------------------------- Routes --------------------------------------------------

// mount the routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); // connect the new created middleware with the app file
app.use('/api/v1/users', userRouter); // the /api/v1/users is the parent URL
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
