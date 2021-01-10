const multer = require('multer')


module.exports = multer({
   storage: multer.diskStorage({}),
    // limits: {fileSize: 2048},
    fileFilter: ((req, file, cb) =>{
       if (!file.mimetype.match(/jpeg|jpg|png|gif$i/)) {
        cb(new Error('File type not supported'), false)
         return
      }

       cb(null, true)
    })
})
