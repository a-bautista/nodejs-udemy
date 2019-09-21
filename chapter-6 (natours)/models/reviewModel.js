// review / rating / createdAt / ref to tour / ref to user /
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empyt!']
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },

    createdAt: {
      type: Date,
      default: Date.now()
    },
    // the ref value will be used for the populate keyword
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    // the ref value will be used for the populate keyword
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },

  // The code from below indicates that the virtual properties will be displayed in the JSON and Object.
  // A virtual property displays virtual column that is added to the results, in this case, this virtual property
  // will be added to the JSON and Object.

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/*
    The middleware query from below retrieves all the reviews and it helps us to display the tour name and the user name 
    and photo values instead of displaying the IDs tours and usernames. This is parenting referencing between Tour and
    Review models, that is, the parent (tour) doesn't know about its reviews (children), the reviews show the tour but it
    is not aware about this.
*/

reviewSchema.pre(/^find/, function(next) {
  /*
    this.populate({
    path: 'tour',
    select: 'name'
  }).populate({
    path: 'user',
    select: 'name photo'
  });
  */
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
