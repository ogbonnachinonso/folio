const mongoose = require('mongoose');

let reviewSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  work:{
    type: String,
    required: true,
  },
  story: {
    type: String,
    required: true,
  },
  
  createdAt:{
    type: Date,
    default: Date.now
  },
  imgUrl:{  
        type: String 
    } 
});


module.exports = mongoose.model('Review', reviewSchema);