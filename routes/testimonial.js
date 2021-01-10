const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auths');
const Review = require('../models/review');
const User = require('../models/user');


const path = require('path');

require('dotenv').config();
const cloudinary = require('cloudinary');
require('../handler/cloudinary');
const upload = require('../handler/multer');


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
      res.render('review/reviewDetails', { review: review });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/testimonial');
      console.error(err)
    });
});
// Get routes add folio
router.get('/create', (req, res) => {
  res.render('review/add');
});

// Post routes Add Review
router.post('/create', upload.single('image'),  async (req, res, next) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path)
    const review = new Review()
    review.name = req.body.name,
      review.work = req.body.work,
      review.story = req.body.story,
      review.imgUrl = result.secure_url
    await review.save()
    req.flash('success_msg', 'Testimonial Added Successfully')
    res.redirect('/reviews')
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    console.error(err);
    res.redirect('/create');
  }
});

// Get route dashboard
const verify = require("../middleware/role");
router.get("/reviews", (req, res) => {
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
router.get("/edit/:id", upload.single('image'), ensureAuth, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    res.render('review/edit', { review });
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/reviews');
  }
});

router.post('/edit/:id', upload.single("image"), ensureAuth, verify.isAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(review.imgUrl);
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    let data = {
      name: req.body.name,
      work: req.body.work,
      story: req.body.story,
      imgUrl: result.secure_url

    };
    await Review.findByIdAndUpdate({ _id: req.params.id }, data, {
      new: true,
      // runValidators: true,
    })
    req.flash('success_msg', 'Testimonial updated successfully');
    res.redirect('/reviews');
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/reviews');
    console.error(err)
  }
});

//delete request starts here
router.post("/delete/:id", ensureAuth, verify.isAdmin, async (req, res) => {
  try {
    // Find review by id
    let review = await Review.findById(req.params.id);
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(review.imgUrl);
    // Delete review from db
    await review.remove();
    req.flash('success_msg', 'Testimonial post deleted successfully');
    res.redirect('/reviews');
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/reviews');
  }
});

module.exports = router;