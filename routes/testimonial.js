const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auths');
const Review = require('../models/review');
const User = require('../models/user');



// Get routes home
router.get("/testimonial", (req, res) => {
  Review.find({})
    .then(reviews => {
      res.render('review/testimony', { reviews: reviews });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/index');
    })
});

router.get('/testimonial/:id', (req, res) => {
  Review.findOne({ _id: req.params.id })
    .then((review) => {
      res.render('review/reviewDetails',{ review: review });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/testimonial');
      console.error(err)
    });
});
// Get routes add folio
router.get('/create',  (req, res) => {
  res.render('review/add');
});

//post request starts here
router.post('/create',  (req, res) => {
  let newReview = {
    name: req.body.name,
    work: req.body.work,
    story: req.body.story,
    imgUrl: req.body.imgUrl
  };

  Review.create(newReview)
    .then((review) => {
      req.flash('success_msg', 'Testimonial Added Successfully')
      res.redirect('/reviews')
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      console.error(err);
      res.redirect('/create');
    });
});

// Get route dashboard
const verify = require("../middleware/role");
 router.get("/reviews",  (req, res) => {
  Review.find({})
    .then(reviews => {
      res.render('review/reviews', { reviews: reviews });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/login');
    })
});

// Get routes edit/:id
router.get('/edit/:id', ensureAuth, (req, res) => {

  let searchQuery = { _id: req.params.id };

  Review.findOne(searchQuery)
    .then(review => {
      req.flash('success_msg', 'Testimonial Details edited Successfully');
      res.render('review/edit', { review: review });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/reviews');
    });
});


router.post('/edit/:id', ensureAuth, verify.isAdmin, (req, res) => {
  let searchQuery = { _id: req.params.id };

  Review.updateOne(searchQuery, {
    $set: {
      name: req.body.name,
      work: req.body.work,
      story: req.body.story,
      imgUrl: req.body.imgUrl
    }
  })
    .then(review => {
      req.flash('success_msg', 'Testimonial updated successfully');
      res.redirect('/reviews');
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/reviews');
      console.error(err)
    });
});

//delete request starts here
router.post('/delete/:id', ensureAuth, verify.isAdmin, (req, res) => {
  let searchQuery = { _id: req.params.id };

  Review.remove(searchQuery)
    .then(review => {
      req.flash('success_msg', 'Testimonial post deleted successfully');
      res.redirect('/reviews');
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/reviews');
    });
});
module.exports = router;