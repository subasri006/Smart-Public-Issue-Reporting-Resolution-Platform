const path = require('path');
const fs = require('fs');
const env = require('../config/env');

class FileStorageService {
  loadFile(fileName) {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name');
    }

    // Prevent path traversal attacks
    const safeBaseName = path.basename(fileName);
    const resolvedPath = path.resolve(env.UPLOAD_DIR, safeBaseName);

    if (!resolvedPath.startsWith(path.resolve(env.UPLOAD_DIR))) {
      throw new Error('Access denied: path traversal detected');
    }

    if (!fs.existsSync(resolvedPath)) {
      const error = new Error(`File not found: ${fileName}`);
      error.statusCode = 404;
      throw error;
    }

    return resolvedPath;
  }

  deleteFile(fileName) {
    try {
      const filePath = this.loadFile(fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.warn(`[FileStorage] Could not delete file ${fileName}:`, err.message);
    }
  }
}

module.exports = new FileStorageService();
module.exports.FileStorageService = FileStorageService;
