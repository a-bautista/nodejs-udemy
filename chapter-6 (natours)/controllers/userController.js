const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// ------------------------------- Functions in the route handlers ---------------------------------------

const filterObj = (obj, ...allowedFields) => {
  /*
    obj is the request object in the format of:

     "data": {
        "user": {
            "role": "user",
            "_id": "5d83c3b92993191ca0738a60",
            "name": "userC",
            "email": "hellouserc@hotmail.com",
            "photo": "This is your picture",
        }
      }
    
      So, we go through each key of the object to search for the allowedFields (name, email) and if there's any match then
      copy those elements in the new object.

  */

  const newObj = {}; // this is an object
  // This loop goes through an object in JS and returns the results in an array of keynames
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
    else console.log(`This new field is not allowed: ${obj[el]}`);
  });
  return newObj;
};

/*
exports.getAllUsers = async (req, res, next) => {
  const users = await User.find();

  // send response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
};
*/

/*
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
*/

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// this is based on the userModel
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead'
  });
};

/*
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
*/

/*
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
*/

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User); // do NOT update passwords with this
exports.deleteUser = factory.deleteOne(User);

exports.updateMe = async (req, res, next) => {
  // 1) Create error if the user tries to change the password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(AppError('This route is not for password updates. Please use /updateMyPassword', 400));
  }

  // 2) Filtered out unwanted field names that are not allowed to be updated
  // findByIdAndUpdate is used for sensitive data such as name and email
  const filterBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, { new: true, runValidators: true });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
};

exports.deleteMe = async (req, res, next) => {
  // the user is not deleted but changed to active state true to false
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
};
