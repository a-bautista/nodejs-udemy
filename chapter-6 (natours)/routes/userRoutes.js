const express = require('express'); // create the middleware
const userRouter = express.Router(); // middleware connected to the userRouter

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// -------------------------------------- Route handlers --------------------------------------------------

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
