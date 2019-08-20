const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express(); // express is defined to create middlewares in node.js

// ----------------------------- Middleware sections -------------------------------------

app.use(express.json()); // middleware which is necessary for the POST requests
// In Express everything is a middleware

/*app.use((req, res, next) => {
  console.log('Hello from the Middleware');
  next(); // this is necessary to continue on to the next request
}); */

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // a new method to the req was added
  next();
});

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // read the environment variables
  app.use(morgan('dev')); // login middleware
}

app.use(express.static(`${__dirname}/public`));

// ----------------------------- End of middleware sections -------------------------------

/*
app.get('/', (req, res) => {
  res.status(200).json({ message: 'This is the server calling you', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('You can post  to this endpoint...');
});
*/

// ----------------------------- Route Handlers -----------------------------------------

// ----------------------------- End of route handlers -----------------------------------

// ----------------------------- Routes --------------------------------------------------

// mount the routers
app.use('/api/v1/tours', tourRouter); // connect the new created middleware with the app file
app.use('/api/v1/users', userRouter); // the /api/v1/users is the parent URL

// --------------------------- End of routes -------------------------------------------

/*
app.post('/api/v1/tours', (req, res) => {
  //console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // req body contains the data that we send to the server
  tours.push(newTour);

  // read the new resource that is received and store it in the json file
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(201).json({
      // give a response once this resource has been created
      status: 'success',
      data: {
        tour: newTour
      }
    }); // 201 created
  });
});

// update a specific id
app.patch('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'Invalid ID'
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
});

app.delete('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      data: {
        message: 'Invalid ID'
      }
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
*/

/*app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
}); */

//:id defines the id of the tour you want to retrieve
/*
app.get('/api/v1/tours/:id', (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // trick to convert an id to a number
  const tour = tours.find(el => el.id === id); // find the id element to verify if we have data

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});
*/

//-------------------------------- Start the server ----------------------------------------

//-------------------------- End of start the server ----------------------------------------

module.exports = app;
