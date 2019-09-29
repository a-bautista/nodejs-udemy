const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// once the user is signed in then create a token for him/her
// in MongoDB, the _id is used for the ids
// const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  /* What is a cookie? It's a small piece of text that the server sends to the clients. Once the client receives the cookie,
   it will store  and send it back along with all the future requests to the same server. */

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //secure: true, // this indicates to use https
    httpOnly: true // this indicates that the cookie will store the JSON web token in a cookie and won't be destroyed
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; // this won't display the generated hashed password in the results

  try {
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error.message
    });
  }
};

// If something is marked with exports then it is going be a middleware.

// We use async because we are going to use a promise to retrieve db content
exports.signup = async (req, res, next) => {
  // the code from below stores users but the user can be admin as well if the default is set to admin
  // const newUser = await User.create(req.body);

  // the code from below help us to store users not as admins
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    active: req.body.active
  });

  createSendToken(newUser, 201, res);
};

exports.logout = (req, res) => {
  try {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({
      status: 'success'
    });
  } catch (error) {
    console.log(error);
  }
};

exports.protect = async (req, res, next) => {
  //1) Get token and check if it's there
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    // this helps us to validate the users via cookie instead of the validation headers used in Postman
  } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    // this addresses the problem
    token = req.cookies.jwt;
  }

  //console.log(token);

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  //2) Verification of the token (has the token expired or has the data been modified?)
  // the code from below needs to be converted into a promise because jwt.verify is synchronous and we try to avoid
  // synchronous functions because of the nature of node.js
  //jwt.verify(token, process.env.JWT_SECRET);
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //3) In case the user has been deleted but his/her token had been given, then you need to make sure that the token becomes invalid
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('The user assigned to the token does not longer exist', 401));
  }

  //4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    //issued at (iat)
    return next(new AppError('User recently changed the password. Please, log in again.', 401));
  }

  // Grant access to protected route
  req.user = freshUser;
  res.locals.user = freshUser;
  next(); //continue with the next process, that's the purpose of the next
};

// Only for rendered pages, check if the user is logged in
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      //2) In case the user has been deleted but his/her token had been given, then you need to make sure that the token becomes invalid
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      //3) Check if user changed password after the token was issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        //issued at (iat)
        return next();
      }

      // There is a logged in user
      // Each pug template will have access to the response.locals
      res.locals.user = freshUser;
      return next(); //continue with the next process, that's the purpose of the next
    } catch (error) {
      console.log(error);
      return next();
    }
  }
  next();
};

// We use async because we are going to use a promise to retrieve db content
exports.login = async (req, res, next) => {
  const { email, password } = req.body; // object de-sctructuring

  //1) Check if email or password exists
  if (!email || !password) {
    return next(new AppError('Please, provide email and password!', 400));
  }

  //2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); //display the password in hash not in plain text

  //console.log(user);

  // use the instance method from the userModel.js to compare the passwords
  // password comes from the user
  // user.password comes from the db

  // if there is no user or the password is incorrect then send the error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  //3) If everything is correct, that is, not any of the previous if statements became true then
  // send a token to client to complete login.
  // The user._id ("5d6c30aad1b8a314a4b0785d") gets a token for authentication, so he/she can navigate across the website

  createSendToken(user, 200, res);
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // restrictTo contains roles ['admin', 'lead-guide'] and it comes from protected tourRoutes.js

    // Because the role 'user' is not included in the roles array then this is going to throw the 403 error
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  //1) Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}.\n
  If you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      //req.body.email
      email: user.email,
      subject: 'Your password reset token (valid for 10 min).',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later.'), 500);
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) Get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changePasswordAt property for the user

  // 4) Log the user in, send JWT

  createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  //1) Get user from collection
  // In order to update the password the user must be logged in first, so we need to get his/her ID with its current password
  // findById is used mainly for passwords
  const user = await User.findById(req.user.id).select('+password');
  console.log(user);

  // if there is not any user with the id and pwd then return this error
  if (!user) return next(new AppError('There is no such user with that email', 404));

  //2) Check if the POSTED password is correct
  // this method comes from the userModel.js
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong.'), 401);

  //3) If the password is correct, then update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4) Log user in, send JWT
  createSendToken(user, 200, res);
};
