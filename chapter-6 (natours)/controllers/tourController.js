//const fs = require('fs');
const Tour = require('./../models/tourModel'); // get the Data from the Tour model schema

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)); // read the json file

// ------------------------------- Functions in the route handlers ---------------------------------------

/*

exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next(); // next is necessary to call the next middleware
}; */

/*
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next(); //move on to the next middleware if the if statement is not validated
};
*/

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error
    });
  }

  //console.log(req.params);
  //const id = req.params.id * 1; // trick to convert an id to a number
  //const tour = tours.find(el => el.id === id); // find the id element to verify if we have data
};

//the created tour goes at the end of the json
exports.createNewTour = async (req, res) => {
  // sync and await are used for handling promises
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      // give a response once this resource has been created
      status: 'success',
      data: {
        tour: newTour
      }
    }); // 201 created
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
/*
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // req body contains the data that we send to the server
  tours.push(newTour);
  */

// read the new resource that is received and store it in the json file
//fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {

//});

// you use patch to update the object
// you can use put as well but that's going to replace the object
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
