const express = require('express');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = express.Router({ mergeParams: true }); // we use the id to get the id parameter of the tour from the tourRoutes
const authController = require('./../controllers/authController');

reviewRouter
  .route('/')
  // get either all reviews of tours or all the reviews for a specific tour
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds, // this middleware is used as a middlestep before using the createReview
    reviewController.createReview
  );

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = reviewRouter;
