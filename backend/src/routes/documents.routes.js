const express = require('express');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();

router.post(
  '/upload',
  documentsController.requireUser,
  documentsController.uploadMiddleware,
  documentsController.upload,
);
router.get('/documents', documentsController.requireUser, documentsController.list);
router.get(
  '/documents/:id/download',
  documentsController.requireUser,
  documentsController.download,
);

module.exports = router;