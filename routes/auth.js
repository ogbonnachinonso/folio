const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const async = require('async');
const nodemailer = require('nodemailer');
const Folio= require('../models/folio');
const User= require('../models/user');
const { request } = require("express");
const { ensureGuest } = require('../middleware/auths');


function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash("error_msg", "Please Login in fisrt to access this page");
  res.redirect('/login');
}

//login get route

router.get('/login', (req, res) => {
  res.render('auth/login');
});

//signup get route
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

//forgot get route
router.get('/forgot', (req, res) => {
  res.render('auth/forgot');
});
// Change Password Get Route
router.get('/changepassword', (req, res) => {
  res.render('auth/change');
});
// New Password Get Route
router.get('/newpassword', (req, res) => {
  res.render('auth/newpass');
});

//forgot reset route

router.get('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired');
        res.redirect('/forgot');
      }
      res.render('auth/change', { token: req.params.token });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR:' + err);
      res.redirect('/forgot');
    })
});

//signup post route
router.post('/signup', ensureGuest, (req, res) => {
  let { username, email, password } = req.body;
  let userData = {
    username: username,
    email: email
  };
  User.findOne({ username: req.body.username }, function (err, user) {
    if (err)
      console.log(err);
    if (user) {
      req.flash("error_msg", "A user with that email already exists...");
      res.redirect("/signup");
    } else {
      User.register(userData, password, (err, user) => {
        if (err) {
          req.flash("error_msg", "ERROR:" + err);
          res.redirect('/signup');
        }
        passport.authenticate('local')(req, res, () => {
          req.flash("success_msg", "Account Created Successfully");
          res.redirect('/login')
        });
      });
    }
  });
});

// login post route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: 'Invalid email or password. Try again!!'
}))

//Post route forgot password
router.post('/forgot', (req, res, next) => {
  let recoveryPassword = '';
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        let token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email })
        .then(user => {
          if (!user) {
            req.flash('error_msg', 'user does not exist with this email');
            return res.redirect('/forgot');
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 1800000; //1/2 hour

          user.save(err => {
            done(err, token, user);
          });
        })
        .catch(err => {
          req.flash('error_msg', 'ERROR:' + err);
          res.redirect('/forgot');
        })
    },
    (token, user) => {
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      let mailOptions = {
        to: user.email,
        from: 'Ogbfolio chinonsoubadire2@gmail.com',
        subject: 'Recovery Email from Ogbfolio ',
        text: 'Please click the following link to recover your password:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request this, please ignore this email.'
      };
      smtpTransport.sendMail(mailOptions, err => {
        req.flash('success_msg', 'Email sent with further instructions. Please check that.');
        res.redirect('/forgot');
      })
    }
  ], err => {
    if (err) res.redirect('/forgot');
  });
});

//Post Reset Route
router.post('/reset/:token', (req, res) => {
  async.waterfall([
    (done) => {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        .then(user => {
          if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired');
            res.redirect('/forgot');
          }
          if (req.body.password !== req.body.confirmpassword) {
            req.flash('error_msg', "Password don't match");
            return res.redirect('/forgot');
          }
          user.setPassword(req.body.password, err => {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(err => {
              req.logIn(user, err => {
                done(err, user);
              })
            });
          });
        })
        .catch(err => {
          req.flash('error_msg', 'ERROR:' + err);
          res.redirect('/forgot');
        });
    },
    (user) => {
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      let mailOptions = {
        to: user.email,
        from: 'Ogbfolio chinonsoubadire2@gmail.com',
        subject: 'Your Password is changed',
        text: 'Hello, ' + user.username + '\n\n' +
          'This is a confirmation that the password for your account' + user.email + 'has been changed.'
      };
      smtpTransport.sendMail(mailOptions, err => {
        req.flash('success_msg', 'Email sent with further instructions. Please check that.');
        res.redirect('/login');
      });
    }
  ], err => {
    res.redirect('/login');
  });
});


//Post New Password Route
router.post('/newpassword', ensureAuth, (req, res) => {
  if (req.body.password !== req.body.confirmpassword) {
    req.flash('error_msg', "Password don't match. Type Again!");
    return res.redirect('/newpassword');
  }
  User.findOne({ email: req.user.email })
    .then(user => {
      user.setPassword(req.body.password, err => {
        user.save()
          .then(user => {
            req.flash('success_msg', 'Password Changed Successfully.');
            res.redirect('/dashboard')
          })
          .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err);
            res.redirect('/newpassword');
          })
      })
    })

});
// Get route logout
router.get('/logout', ensureAuth, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You Are logged Out')
  res.redirect('/login');
})

// Get route dashboard
const verify = require("../middleware/role");
router.get("/dashboard", ensureAuth, verify.isAdmin, (req, res) => {
  Folio.find({})
    .then(folios => {
      res.render('folio/dashboard', { folios: folios });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/login');
    })
});



module.exports = router;