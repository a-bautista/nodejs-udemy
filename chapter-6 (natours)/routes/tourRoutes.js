const express = require('express');
const tourController = require('../controllers/tourController');
const tourRouter = express.Router(); // tourRouter is a middleware inherited from the express middleware and it is necessary to make the routes to be working
const authController = require('./../controllers/authController');

// -------------------------------------- Route handlers --------------------------------------------------

// check if the id exists

//tourRouter.param('id', tourController.checkID);
// '/api/v1/tours'/top-5-cheap <-- this is the new address for the alias

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter
  .route('/') // you go to the /api root
  // the authoController.protect is a middleware function that is going to be executed first before getting all the tours
  .get(authController.protect, tourController.getAllTours)
  //.post(tourController.checkBody, tourController.createNewTour);
  .post(tourController.createNewTour);

tourRouter
  .route('/:id') // you go to the id root
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = tourRouter;
