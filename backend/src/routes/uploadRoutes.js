const express = require('express');
const fileUploadController = require('../controllers/fileUploadController');

const router = express.Router();

router.get('/:fileName', (req, res, next) =>
  fileUploadController.downloadFile(req, res, next)
);

module.exports = router;
