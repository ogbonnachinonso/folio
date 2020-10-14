const mongoose = require('mongoose');

let folioSchema = new mongoose.Schema({
 category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  createdAt:{
    type: Date,
    default: Date.now
  },
  img: String
   
});



module.exports = mongoose.model('Folio', folioSchema);