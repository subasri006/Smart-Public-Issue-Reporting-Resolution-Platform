const fileStorageService = require('../services/fileStorageService');
const path = require('path');

class FileUploadController {
  downloadFile(req, res, next) {
    try {
      const fileName = req.params.fileName;
      const filePath = fileStorageService.loadFile(fileName);

      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FileUploadController();
