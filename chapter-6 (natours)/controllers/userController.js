const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

/*
const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/users');
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split('/')[1];
    callback(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});
*/

// keep the files stored in buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new AppError('Not an image, please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

// not working cannot read property of undefined

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

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

exports.updateMe = async (req, res, next) => {
  // 1) Create error if the user tries to change the password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(AppError('This route is not for password updates. Please use /updateMyPassword', 400));
  }

  // 2) Filtered out unwanted field names that are not allowed to be updated
  // findByIdAndUpdate is used for sensitive data such as name and email
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;

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

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User); // do NOT update passwords with this
exports.deleteUser = factory.deleteOne(User);
