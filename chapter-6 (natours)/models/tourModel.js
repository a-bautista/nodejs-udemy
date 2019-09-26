const mongoose = require('mongoose');
const slugify = require('slugify');

//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be equal or above 1.0'],
      max: [5, 'Rating must be equal or below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          // this only works when creating a new document
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price'
      }
    },
    summary: {
      type: String,
      trim: true, // this is a schema type for String and will remove the whitespace white spaces in the beginning and ending
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // this will not show the createAt field when retrieving the data
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },

    startLocation: {
      // GeoJSON is used to specify Geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      //longitude (y) and latitude (x)
      coordinates: [Number],
      address: String,
      description: String
    },
    // Embedded documents (denormalization) for tours to locations
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // Embedded documents (denormalization)  for tours to users
    //guides: Array
    // Referencing documents
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // may be necessary to remove the ' '
      }
    ]

    /*
    This will connect the tours with the reviews but we will apply a virtual populate instead of this solution.
    reviews: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Review' 
    }]
    */
  },
  // The code from below indicates that the virtual properties will be displayed in the JSON and Object.
  // A virtual property displays virtual column that is added to the results, in this case, this virtual property
  // will be added to the JSON and Object.
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// set these fields to be indexes
/* How do you decide to make a field an index? Set the fields that are most used as indexes. */
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // necessary for geolocation queries

// define a virtual property for your schema to display the duration weeks
// virtual properties cannot be used in queries
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

/* 
   This is a virtual populate which allows us to connect the tours with the reviews.
   We could create an array to keep track of all the reviews for a tour but this is not recommended because 
   we do not want to have an array of no length defined.
*/
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //foreign key that is found in the reviewModel
  localField: '_id' // connect the id of this model (Tour Model) with the foreign key of the review
});

// There are 4 types of middleware in Mongoose: query, document, aggregate and model.
// Middlewares in Mongoose are like SQL triggers.

// Document middleware: runs before .save() and .create()
// Hooks can be seen as save, aggregation function in the post
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true }); // create a new property to the object
  next();
});

// this is used for denormalizing data
/*
tourSchema.pre('save', async function(next) {
  const guidesPromises = this.guides.map(async id => User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});

// Query middleware
// Used only in the queries and can be used for

/*tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});*/

// the solution from below is an extension of above's solution because
// if you try to look by id then the secretTours will not appear
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds!`);
  //console.log(docs);
  next();
});

/*
  Every time we query for tours, we will display the normalized model into an embedded model with the populate keyword.
  The select indicates to hide the fields __v and passwordChangedAt and we used the '-' operator.  
*/
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// Aggregation middleware (will be used with the Tour.aggregate)
// In the aggregation results, you will be displayed with all the tours but we need to hide the secret tour, so we use
// the aggregate middleware
//tourSchema.pre('aggregate', function(next) {
//  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//  console.log(this.pipeline());
//  next();
//});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
