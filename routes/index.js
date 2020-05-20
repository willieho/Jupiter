var express = require('express');
var { DIRECTORY_NAME, FILE_TYPE } = require('../helper/fileSystemHelper');
var path = require('path');
var router = express.Router();
var FileController = require('../controller/FileController');
var fileController;
const crypto = require('crypto');

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
  // set up lock
  let redisClient = await req.redisClient;
  const key = 'FILE_UPDATED_KEY_' + req.params.fileId;
  const clientKey = generateKey();
  await redisClient.exists(key, function (err, reply) {
    // if lock not exist
    if (reply !== 1) {
      redisClient.setnx(key, clientKey, (err, reply) => { 
        if (reply === 1) {
          console.log('set expired');
          redisClient.expire(key, 30);
        }
      });
    }
  });

  let controller = await getFileController(req.fileManager);
  let file = controller.getFileById(req.params.fileId);
  res.render('fileEditing', { file: file, clientKey: clientKey });
});

router.put('/updateFile', async (req, res, next) => {
  console.log("================updatefile================");
  let redisClient = await req.redisClient;
  let controller = await getFileController(req.fileManager);
  await redisClient.get(getRedisKeyWithId(req.body._id), (err, replay) => {
    if (!replay || replay === req.body.clientKey) {
      controller.updateFile(req.body._id, req.body.name, req.body.content);
      res.sendStatus(200);
      console.log("================end of updatefile================");
    } else {
      console.log('failed blcokkkk');
      res.sendStatus(403);
      console.log("================end of updatefile else================");
    }
  });
});

/*
router.put('/updateFile', async (req, res, next) => {
  let redisClient = await req.redisClient;
  let controller = await getFileController(req.fileManager);
  let getKey = new Promise((resolve, reject) => {
    redisClient.get("FILE_UPDATED_KEY", (err, replay) => {
      if (!replay || replay === req.body._id) {
        console.log('id match');
        resolve(replay);
      } else {
        console.log("id doesnt match");
        reject(new Error("id doesnt match"))
      }
    });
  });
  getKey.then(resolve => {
    console.log('then OK');
    controller.updateFile(req.body._id, req.body.name, req.body.content);
    res.send('OK');
  }, reject => {
    console.log('then not OK');
    res.send('Forbidden');
  });
});
/*
router.put('/updateFile', async (req, res, next) => {
  // check lock
  let redisClient = await req.redisClient;
  let controller = await getFileController(req.fileManager);
  let getKey = new Promise((resolve, reject) => {
    redisClient.get("FILE_UPDATED_KEY", (err, replay) => {
      if (replay === req.body._id) {
        console.log('id match');
        resolve(replay);
      } else {
        console.log("id doesnt match");
        reject(new Error("id doesnt match"))
      }
    });
  });
  let checkExist = new Promise(function (resolve, reject) {
    redisClient.exists('FILE_UPDATED_KEY', function (err, reply) {
      resolve(reply);
    });
  });
  // let update = new Promise((resolve, reject) => {
  //   controller.updateFile(req.body._id, req.body.name, req.body.content);
  //   resolve('Success');
  // })
  checkExist.then((resolve) => {
    if (resolve === 1) {
      console.log('OKkkkkkkk 111111')
      return getKey;
    } else {
      console.log('NNNNNNNOKkkkkkkk 1111111');
      controller.updateFile(req.body._id, req.body.name, req.body.content);
    }
  }).then((resolve) => {
    console.log('OKkkkkkkk')
    return controller.updateFile(req.body._id, req.body.name, req.body.content);
  }, (reject) => {
    console.log('nok reject', reject);
    console.log('NNNNNNNOKkkkkkkk');
    return reject;
  }).then((resolve) => {
    console.log("finallyyyyyyyyy");
    res.send('OK');
  }, (reject) => {
    console.log("finallyyyyyyyyy nnnnokkkkkk");
    res.send('Forbidden');
  });
  // checkExist.then((resolve) => {
  //   controller.updateFile(req.body._id, req.body.name, req.body.content);
  //   console.log('OKkkkkkkk');
  //   res.send('OK');
  // }, (reject) => {
  //   console.log('NNNNNNNOKkkkkkkk');
  //   res.send('Forbidden');
  // });


  // await redisClient.exists('FILE_UPDATED_KEY', function (err, reply) {
  //   if (reply !== 1 || reply === req.body._id) {
  //     await controller.updateFile(req.body._id, req.body.name, req.body.content);
  //     res.send('OK');
  //   } else {
  //     res.send('Forbidden');
  //   }
  // });
});
*/

/* Download */
router.get('/download/:fileName', (req, res) => {
  res.download(path.join(__dirname, '../' + DIRECTORY_NAME + '/' + req.params.fileName + FILE_TYPE), (err) => {
    if (err) {
      console.log(err);
    }
  });
})

/* Lock */
// let isLockExist = async (redisClient) => {
//   let exist = await redisClient.exists('FILE_UPDATED_KEY', function (err, reply) {
//     if (reply === 1) {
//       return true;
//     } else {
//       console.log("not exist!!!!!")
//       return false;
//     }
//   });
//   console.log(exist);
//   return exist;
// }

// unlock when leaving Edit page
router.post('/unlock', async (req, res) => {
  console.log("==================unlock===================");
  let redisClient = await req.redisClient;
  const redisKey = getRedisKeyWithId(req.body._id);
  await redisClient.get(redisKey, (err, replay) => {
    console.log('unlock replay', replay);
    console.log('unlock clientKey', req.body.clientKey);
    if (replay === req.body.clientKey) {
      redisClient.del(redisKey, function (err, reply) {
        console.log("* Remove Redis Key *");
        res.send('OK');
        console.log("==================end of unlock===================");
      });
    } else {
      res.send('OK');
      console.log("==================end of unlock else===================");
    }
  });
})

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
