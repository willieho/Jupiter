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

router.get('/edit/:fileId', async (req, res, next) => {
  let controller = await getFileController(req.fileManager);
  let file = controller.getFileById(req.params.fileId);
  res.render('fileEditing', { file: file });
});

router.put('/updateFile', async (req, res, next) => {
  let controller = await getFileController(req.fileManager);
  await controller.updateFile(req.body._id, req.body.name, req.body.content);

  res.send('OK');
});

let getFileController = async (fileManager) => {
  if (fileController && fileController !== 'null' && fileController !== 'undefined') {
    return fileController;
  }
  fileController = new FileController(await fileManager)
  return fileController;
}

module.exports = router;
