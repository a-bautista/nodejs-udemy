const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

/*
exports.getAllReviews = async (req, res, next) => {
  let filter = {};

  // get the tour id from the URL in order to see the reviews for one specific route, in contrary case then get all reviews
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
};
*/

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  // if we didn't specify any tour id then we define it from the URL
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // if we didn't specify any user id then we define it from the URL
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

/*
exports.createReview = async (req, res, next) => {
  // Allow nested routes
  // if we didn't specify any tour id then we define it from the URL
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // if we didn't specify any user id then we define it from the URL
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newReview
    }
  });
};
*/

exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
