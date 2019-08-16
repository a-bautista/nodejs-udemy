const express = require('express'); // create the middleware
const userRouter = express.Router(); // middleware connected to the userRouter

//const express = require('express');
const userController = require('../controllers/userController');
//const userRouter = express.Router();

// -------------------------------------- Route handlers --------------------------------------------------

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
