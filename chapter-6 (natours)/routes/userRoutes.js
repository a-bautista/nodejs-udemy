const express = require('express'); // create the middleware
const userRouter = express.Router(); // middleware connected to the userRouter

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// -------------------------------------- Route handlers --------------------------------------------------

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);

userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

userRouter.get('/me', authController.protect, userController.getMe, userController.getUser); // when you logout you should redirect to the main page, this is a flaw that needs to be fixed
userRouter.patch('/updateMyPassword', authController.protect, authController.updatePassword);
userRouter.patch('/updateMe', authController.protect, userController.updateMe);
userRouter.delete('/deleteMe', authController.protect, userController.deleteMe);

userRouter.use(authController.protect); // all the routers after this point will be protected
userRouter.use(authController.restrictTo('admin')); // all the routes after this point will require authentication

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
