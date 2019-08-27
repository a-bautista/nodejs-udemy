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
    // Build query
    // 1A) Filtering

    // 127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy
    // Un-comment the code from below and use the link from above to see the working API
    // console.log(req.query);
    // const tours = await Tour.find(req.query);
    // end of comments

    const queryObj = { ...req.query }; //de-structuring each value goes into a field
    // the fields from below need to be excluded because we don't want them to be present in the URL
    const excludedFields = ['page', 'sort', 'limit', 'fields']; // for some reason the field sort is not being excluded
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    console.log(JSON.parse(queryStr));

    /*
    If we use the await Tour then we are indicating that the rest of the code will be executed and we won't have
    any chance to do any sorting to the tour results because the code will have reached the end, so we need to put this
    in a variable.

    const tour = await Tour.find(queryObj);
    */

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    // 127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // default sorting
      query = query.sort('-ratingsAverage');
    }

    // ascending
    // 127.0.0.1:3000/api/v1/tours?sort=price

    // descending
    // 127.0.0.1:3000/api/v1/tours?sort=-price

    // 3) Field limiting
    // 127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      // exclude the fields that start with the _v every time there is not any filter selected
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1; // the || is used to set a value by default, so give by default page 1
    const limit = req.query.limit * 1 || 100; //  limit by default 100 results
    const skip = (page - 1) * limit;

    // 127.0.0.1:3000/api/v1/tours?page=3&limit=10
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page doesnt exist');
    }

    // Execute query
    const tours = await query;

    /*
    const tours = await Tour.find({
      duration: 5,
      difficulty: 'easy'
    });
    */

    // the filter from below is the same as the filter from above
    /*    
    const tours = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');
    */

    // send response
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
      message: error.message
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
