const express = require('express');
 const mongoose = require('mongoose');
 const bodyParser = require('body-parser');
 const nodemailer = require('nodemailer');

const path = require('path');

const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

const Auth = require('./routes/auth');
const Route = require('./routes/folioRoute');
const Router = require('./routes/index');

const Folio = require('./models/folio');
const User = require('./models/user');

const app = express();
require('dotenv').config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//mongoose setup
mongoose.connect(process.env.DATABASE_REMOTE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
},
() => {
  console.log("Database connected successfully");
}
);


// express session
app.use(
  session({
  secret: "mysecret",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection:mongoose.connection})

})
);

 //passport 
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new localStrategy({ usernameField: 'username'}, User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

//middleware for connect flash
app.use(flash());

//setting up messages globally
app.use((req, res, next) => {
  res.locals.success_msg = req.flash(('success_msg'));
  res.locals.error_msg = req.flash(('error_msg'));
  res.locals.error = req.flash(('error'));
  res.locals.currentUser = req.user;
  next();
})

app.use(Router);
app.use(Auth);
app.use(Route);




const port = process.env.PORT ||5000;
app.listen(port, () => console.log(`server running  on port ${port} `))