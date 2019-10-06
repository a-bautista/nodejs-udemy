const Tour = require('./../models/tourModel'); // get the Data from the Tour model schema
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// this middleware is going to handle the sorting of the alias
// the middleware is something that happens between 2 events, i.e., an event before or after saving a document
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/*
exports.getAllTours = async (req, res) => {
  try {
    // Execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tours = await features.query;

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

*/
/*
exports.getTour = async (req, res) => {
  try {
    // the .populate is already in a query middleware
    // connect the virtual property from the Tour Model to display all the reviews for a specific tour
    const tour = await Tour.findById(req.params.id).populate('reviews');
    // We will use the populate method to convert the referenced data to embedded data
    // this will be only implemented in the getTour route, not the getAllTour routes
    //
    //const tour = await Tour.findById(req.params.id).populate({
    //  path: 'guides',
    //  select: '-__v -passwordChangedAt -role'
    //});
    // Tour.findOne({_id: req.params.id})

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404)); // send a return to get out of the getTour
    }

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
};
*/
/*
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
*/
/*
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
*/
/*
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
*/

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' }); // the factory will return the function to retrieve one tour
exports.createTour = factory.createOne(Tour); // the factory will return the function for creating a tour
exports.updateTour = factory.updateOne(Tour); // the factory will return the function for updating any tour
exports.deleteTour = factory.deleteOne(Tour); // the factory will return the function for deleting any tour

// aggregation pipeline stages for creating statistics
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' }, // group the results by difficulty
          num: { $sum: 1 }, // add one for each document
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },

      {
        $sort: { avgPrice: -1 } // descending order
      }

      /*{
        $match: { _id: { $ne: 'EASY' } } // do not show the easy tours
      }*/
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          // this is going to display how the data will be visualized
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: { _id: 0 } // 0 indicates to not show the id
      },
      {
        $sort: { numTourStarts: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getToursWithin = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // radius of the earth in miles and km

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format of lat, lng.', 400));
  }

  console.log(distance, lat, lng, unit);
  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

  try {
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getDistances = async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format of lat, lng.', 400));
  }

  const distances = await Tour.aggregate([
    {
      /* The geoNear will not work unless you create an index called startLocations.coordinates {2dsphere} directly
      in MongoDB compass. You cannot create this index in code because it throws an error. */
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1] // convert to numbers when multiplied by 1
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  try {
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
