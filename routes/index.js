var express = require('express');
var { DIRECTORY_NAME, FILE_TYPE } = require('../helper/fileSystemHelper');
var path = require('path');
var router = express.Router();
var FileController = require('../controller/FileController');
var fileController;
const crypto = require('crypto');
const REDIS_TTL = 60;

/* New page */
router.get('/', async function(req, res, next) {
  res.render('index');  
});

router.get('/new', (req, res, next) => {
  res.redirect('/');
});

router.post('/createFile', async (req, res, next) => {
  let controller = await getFileController(req.fileManager);
  await controller.createFile(req.body.name, req.body.content);

  res.send('OK');
});

/* View page */
router.get('/view', async (req, res, next) => {
  let controller = await getFileController(req.fileManager);
  let fileList = await controller.fetchFiles();
  res.render('allFiles', {fileList: fileList});  
});

/* Edit page */
router.get('/edit/:fileId', async (req, res, next) => {
  // set up lock
  let redisClient = await req.redisClient;
  const key = getRedisKeyWithId(req.params.fileId);
  const clientKey = generateKey();
  await redisClient.exists(key, function (err, reply) {
    // if lock not exist
    if (reply !== 1) {
      redisClient.setnx(key, clientKey, (err, reply) => { 
        if (reply === 1) {
          redisClient.expire(key, REDIS_TTL);
        }
      });
    }
  });

  let controller = await getFileController(req.fileManager);
  let file = controller.getFileById(req.params.fileId);
  res.render('fileEditing', { file: file, clientKey: clientKey });
});

router.put('/updateFile', async (req, res, next) => {
  let redisClient = await req.redisClient;
  let controller = await getFileController(req.fileManager);
  const redisKey = getRedisKeyWithId(req.body._id);
  await redisClient.get(redisKey, (err, replay) => {
    if (!replay || replay === req.body.clientKey) {
      controller.updateFile(req.body._id, req.body.name, req.body.content);
      // unlock
      redisClient.del(redisKey, function (err, reply) {
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  });
});

/* Download */
router.get('/download/:fileName', (req, res) => {
  res.download(path.join(__dirname, '../' + DIRECTORY_NAME + '/' + req.params.fileName + FILE_TYPE), (err) => {
    if (err) {
      console.log(err);
    }
  });
});

/* Lock */
// unlock when leaving Edit page
router.post('/unlock', async (req, res) => {
  let redisClient = await req.redisClient;
  const redisKey = getRedisKeyWithId(req.body._id);
  await redisClient.get(redisKey, (err, replay) => {
    if (replay === req.body.clientKey) {
      redisClient.del(redisKey, function (err, reply) {
        res.send('OK');
      });
    } else {
      res.send('OK');
    }
  });
});

let generateKey = () => {
  return crypto.randomBytes(16).toString('hex');
}

let getRedisKeyWithId = fileId => {
  return "FILE_UPDATED_KEY_" + fileId;
}

let getFileController = async (fileManager) => {
  if (fileController && fileController !== 'null' && fileController !== 'undefined') {
    return fileController;
  }
  fileController = new FileController(await fileManager)
  return fileController;
}

module.exports = router;
