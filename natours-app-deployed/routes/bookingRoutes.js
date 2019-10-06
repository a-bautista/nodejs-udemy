const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const bookingRouter = express.Router();

bookingRouter.use(authController.protect); // seems like i can see all the bookings without being logged in

bookingRouter.get('/checkout-session/:tourid', bookingController.getCheckoutSession);
bookingRouter.use(authController.restrictTo('admin', 'lead-guide'));
bookingRouter
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

bookingRouter
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = bookingRouter;
