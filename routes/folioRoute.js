const express = require('express');
const router = express.Router();
// const passport = require('passport');
// const nodemailer = require('nodemailer');
const { ensureAuth } = require('../middleware/auths');
const Folio = require('../models/folio');
const User = require('../models/user');



// Get routes home
router.get("/portfolio", (req, res) => {
  Folio.find({})
    .then(folios => {
      res.render('folio/portfolio', { folios: folios });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/index');
    })
});

router.get('/folio/:id', (req, res) => {
  Folio.findOne({ _id: req.params.id })
    .then((folio) => {
      res.render('folio/folioDetails',{ folio: folio });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/portfolio');
      console.error(err)
    });
});
// Get routes add folio
router.get('/add', ensureAuth, (req, res) => {
  res.render('folio/addFolio');
});

//post request starts here
router.post('/add', ensureAuth, (req, res) => {
  let newFolio = {
    category: req.body.category,
    description: req.body.description,
    client: req.body.client,
    url: req.body.url,
    img: req.body.img
  };

  Folio.create(newFolio)
    .then((folio) => {
      req.flash('success_msg', 'Portfolio Added Successfully')
      res.redirect('/dashboard')
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      console.error(err);
      res.redirect('/add');
    });
});

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

// Get routes edit/:id
router.get('/edit/:id', ensureAuth, (req, res) => {

  let searchQuery = { _id: req.params.id };

  Folio.findOne(searchQuery)
    .then(folio => {
      req.flash('success_msg', 'folio Details edited Successfully');
      res.render('folio/edit', { folio: folio });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/dashboard');
    });
});


router.post('/edit/:id', ensureAuth, verify.isAdmin, (req, res) => {
  let searchQuery = { _id: req.params.id };

  Folio.updateOne(searchQuery, {
    $set: {
      category: req.body.category,
      description: req.body.description,
      client: req.body.client,
      url: req.body.url,
      img: req.body.img
    }
  })
    .then(folio => {
      req.flash('success_msg', 'folio updated successfully');
      res.redirect('/dashboard');
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/dashboard');
      console.error(err)
    });
});

//delete request starts here
router.post('/delete/:id', ensureAuth, verify.isAdmin, (req, res) => {
  let searchQuery = { _id: req.params.id };

  Folio.remove(searchQuery)
    .then(folio => {
      req.flash('success_msg', 'folio post deleted successfully');
      res.redirect('/dashboard');
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/dashboard');
    });
});
module.exports = router;