const express = require('express');
const tourController = require('../controllers/tourController');
const tourRouter = express.Router(); // tourRouter is a middleware inherited from the express middleware and it is necessary to make the routes to be working

// -------------------------------------- Route handlers --------------------------------------------------

// check if the id exists

tourRouter.param('id', tourController.checkID);

tourRouter
  .route('/') // you go to the /api root
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createNewTour);

tourRouter
  .route('/:id') // you go to the id root
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
