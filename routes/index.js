const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Folio = require('../models/folio');

// landing page
//get route
router.get('/',  (req, res) => {
  res.render('index');
});


router.get('/blog',  (req, res) => {
  res.render('blog');
});


router.get('/projects',  (req, res) => {
  Folio.find({})
    .then(folios => {
      res.render('folio/portfolio', { folios: folios });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/index');
    })
});

router.get('/contact',  (req, res) => {
  res.render('folio');
});

router.post('/send', (req, res) => {
  const output = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>
      <ul>  
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Subject: ${req.body.subject}</li>
      </ul>
      <h3>Message</h3>
      <p>${req.body.message}</p>
    `;

    let transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "5c45eea5672f36",
        pass: "70b8eb187fa5d5"
      }
    });



  // setup email data with unicode symbols
  let mailOptions = {
    from: req.body.email, // sender address
    to: 'minnahogbu@gmail.com', // list of receivers
    subject: 'Message From OgbFolio', // Subject line
    text: req.body.message, // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // res.send(  'Your Email Has Been Sent Successfully' );
    req.flash('success_msg', 'Your Email Has Been Sent Successfully');
    res.redirect('/contact')
   
  });
  // req.flash('success_msg', 'Your Email Has Been Sent Successfully');
  // res.redirect('/contact')
});

module.exports = router;