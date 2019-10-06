/*
    This is a factory function that will be used to return a function as an input value for other functions. 
*/

const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model => async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  try {
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

exports.updateOne = Model => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.createOne = Model => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getOne = (Model, populateOptions) => async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if (populateOptions) query = query.populate(populateOptions);

  const doc = await query;

  try {
    const doc = await Model.findById(req.params.id).populate('reviews');

    if (!doc) {
      return next(new AppError('No doc found with that ID', 404)); // send a return to get out of the getTour
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error
    });
  }
};

exports.getAll = Model => async (req, res, next) => {
  // To allow for nested GET reviews on tour
  let filter = {};
  // get the tour id from the URL in order to see the reviews for one specific route, in contrary case then get all reviews
  if (req.params.tourId) filter = { tour: req.params.tourId };

  try {
    // Execute query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    // it gives you details of the results such as the indexes (check the execution stats section of the results)
    // What is an index? It is a feature that allows Mongo for not searching through all results but just on a few
    //const doc = await features.query.explain();
    const doc = await features.query;
    // send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error.message
    });
  }
};
