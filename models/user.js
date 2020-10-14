const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
  username:String,
  email: {
    type: String,
    required: false,
    unique: true
  },
  password:{
    type: String,
    select: false
  },
role: {
    type: String,
    default: "User"
},
resetPasswordToken : String,
resetPasswordExpires : Date

})
userSchema.plugin(passportLocalMongoose,{usernameField: 'username', emailField: 'email'});

module.exports = mongoose.model('User', userSchema);