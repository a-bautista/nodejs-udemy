const express = require('express');
const tourController = require('../controllers/tourController');
const tourRouter = express.Router(); // tourRouter is a middleware inherited from the express middleware and it is necessary to make the routes to be working
const authController = require('./../controllers/authController');
//const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

// -------------------------------------- Route handlers --------------------------------------------------

// check if the id exists

//tourRouter.param('id', tourController.checkID);
// '/api/v1/tours'/top-5-cheap <-- this is the new address for the alias

// tourRouter
//  .route('/:tourId/reviews')
//  .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

// we are mounting the review route on this tourRoutes in order to connect tours with reviews
// for the specific route tourId, use the reviewRouter routes
tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
//tours-distance?distance=233,center=-40
//tours-distance/233/center/-40,45/unit/mi

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

tourRouter
  .route('/') // you go to the /api root
  // the authoController.protect is a middleware function that is going to be executed first before getting all the tours
  .get(tourController.getAllTours)
  //.post(tourController.checkBody, tourController.createNewTour);
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

tourRouter
  .route('/:id') // you go to the id root
  .get(tourController.getTour)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = tourRouter;
