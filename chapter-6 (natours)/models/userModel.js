const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'This field is mandatory'],
      minlength: [4, 'The name should be at least 4 characters'],
      maxlength: [15, 'The name should be at max 15 characters']
    },

    email: {
      type: String,
      required: [true, 'Please, provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please, provide a valid email']
    },

    photo: {
      type: String
    },

    password: {
      type: String,
      required: [true, 'This field is mandatory'],
      minlength: [8, 'The password should be at least 8 characters'],
      select: false // do not show the password
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
        message: 'Password are not the same!'
      }
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.pre('save', async function(next) {
  // If the password hasn't been modified then do not run the rest of the code and return the next middleware
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the password confirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
