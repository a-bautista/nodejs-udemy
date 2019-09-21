const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

/* Whenever you add a field in the userSchema (role, photo, etc...) you also need to make sure to add it on the 
   authController because  it is there where you get the request data and then use it in the userModel to create the user.
   This does not happen in the tourController because you can add, insert or update tours as you want once the tours routes
   have been secured. 
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'This field is mandatory'],
      minlength: [4, 'The name should be at least 4 characters']
      //maxlength: [15, 'The name should be at max 15 characters']
    },
    email: {
      type: String,
      required: [true, 'Please, provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please, provide a valid email']
    },
    photo: String,
    role: {
      type: String,
      enum: {
        values: ['user', 'guide', 'lead-guide', 'admin']
      },
      required: [true, 'This field is mandatory'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'This field is mandatory'],
      minlength: [8, 'The password should be at least 8 characters'],
      select: false // do not show the password in the database records
    },
    passwordConfirm: {
      type: String,
      required: [true, 'This field is mandatory'],
      minlength: [8, 'The password should be at least 8 characters'],
      validate: {
        // This only works on CREATE and SAVE
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!'
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// this is a middleware that is activated before throwing out all the results
// we use a regular expression in the middleware function to indicate that we are going to apply this to every query that
// starts with find the regular expression looks for words or strings that start with find.
// the query does not show the users who were set up to false
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

//middleware from mongoose to encrypt the password when you create the password
userSchema.pre('save', async function(next) {
  // You use this pre hook when you create or update the password

  // If the password hasn't been modified then return the next middleware and skip running the code from below, otherwise
  // proceed with the rest of the code for encrypting data
  if (!this.isModified('password')) return next();

  // else run the hash of the password with cost of 12 to encrypt it
  this.password = await bcrypt.hash(this.password, 12);

  // Set to undefine the password confirmation because we only need for validation, not for storing
  this.passwordConfirm = undefined;

  // call the next middleware
  next();
});

// this is used to change the PasswordChangedAt property
userSchema.pre('save', function(next) {
  // if the password hasn't been modified or if the document is new then go to the next middleware
  if (!this.isModified('password') || this.isNew) return next();

  // Problem: Sometimes it happens that the token gets created before the passwordChangedAt property gets updated.
  // In order to fix the problem from above we need to set the Date.now() to 1 second before the token gets created.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//the below is an instance method that can be used across all documents in a certain collection for Mongoose
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    console.log(this.passwordChangedAt, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
