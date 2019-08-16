const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json()); // middleware which is necessary for the POST requests
// In Express everything is a middleware

/*
app.get('/', (req, res) => {
  res.status(200).json({ message: 'This is the server calling you', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('You can post to this endpoint...');
});
*/

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
};

const getTour = (req, res) => {
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
};

//the created tour goes at the end of the json
const createNewTour = (req, res) => {
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
};

const updateTour = (req, res) => {
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
};

const deleteTour = (req, res) => {
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
};

app
  .route('/api/v1/tours') // if the route change you can modify it in this line of code
  .get(getAllTours)
  .post(createNewTour);

app
  .route('/api/v1/tours/:id') // if the route change you can modify it in this line of code
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

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

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
