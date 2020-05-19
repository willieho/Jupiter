var express = require('express');
var router = express.Router();
var FileController = require('../controller/FileController');
var fileController;

/* New page */
router.get('/', async function(req, res, next) {
  res.render('index');  
});

router.get('/new', (req, res, next) => {
  res.redirect('/');
});

router.post('/enterFile', async (req, res, next) => {
  let controller = await getFileController(req.fileManager);
  await controller.enterFile(req.body.name, req.body.content);

  res.send('OK');
});

/* View page */
router.get('/view', async (req, res, next) => {
  let controller = await getFileController(req.fileManager);
  let fileList = await controller.fetchFiles();
  res.render('allFiles', {fileList: fileList});  
})

/* Edit page */

// router.get('/edit/:fileId', (req, res, next) => {
//   let fileController = new FileController(await req.fileManager);
//   let file = fileController.getMovieInfo(req.params.movieId);
//   res.render('fileEditing', { movie: movie, reviews: reviews, user: getUserInfo(req) });
// });

router.put('/updateFile', async (req, res, next) => {
  let fileController = new FileController(await req.fileManager);
  // await fileController.updateFile(req.body._id, req.body.content);
  await fileController.updateFile("5ec2b4e282b46c5913dddc50", "this is updated content");

  res.send('OK');
});

let getFileController = async (fileManager) => {
  if (fileController && fileController !== 'null' && fileController !== 'undefined') {
    console.log("return here!");
    return fileController;
  }
  return new FileController(await fileManager);
}

module.exports = router;
