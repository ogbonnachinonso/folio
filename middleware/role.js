module.exports = {
  isAdmin: (req, res, next)=> {
      if(req.user.role === 'User'){
         return next();
      } else {
        res.status(403).send('UNAUTHORIZED');
      }
  }
}