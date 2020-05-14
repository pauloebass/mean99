var mongoose = require('mongoose');


var reviewSchema = new mongoose.Schema({
    author: {type: String, required: true},
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    reviewText: {type: String, required: true},
    createdOn: {
        type: Date,
        "default": Date.now
    }
});

var openingTimeSchema = new mongoose.Schema({
    days: {
        type: String,
        required: true
    },
    opening: String,
    closing: String,
    closed: {
        type: Boolean,
        required: true
    }
});

var pointSchema = new mongoose.Schema({
    type: {
        type: String,
        default: "Point"
    },
    coordinates: {
        type: [Number]
    }
});

var locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: String,
    rating: {
        type: Number,
        "default": 0,
        min: 0,
        max: 5
    },
    facilities: [String],
    // Always store coordinates longitude, latitude order.
    //coords: {
    //    type: [Number],
    //    index: '2dsphere'
    //},
    location: {
        type: { 
            type: String,
            "default": "Point"
        },
        coordinates: []
    },
    openingTimes: [openingTimeSchema],
    reviews: [reviewSchema]
});

/*var locationSchema = new mongoose.Schema({
     username: String,
     text: String,  
     location: {
      type: { type: String },
      coordinates: []
     }
});*/

locationSchema.index({ location: "2dsphere" });
mongoose.model('Location', locationSchema);