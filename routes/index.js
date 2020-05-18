var express = require('express');
var router = express.Router();
var FileController = require('../controller/FileController');

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index');  
});

router.get('/new', (req, res, next) => {
  res.redirect('/');
})

router.post('/enterFile', async (req, res, next) => {
  let fileController = new FileController(await req.fileManager);
  await fileController.enterFile(req.body.name, req.body.content);

  res.send('OK');
});

module.exports = router;
