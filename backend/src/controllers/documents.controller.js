const documentsService = require('../services/documents.service');

function requireUser(req, res, next) {
  const userId = req.get('X-User-Id')?.trim();
  if (!userId) {
    return res.status(400).json({
      error: {
        code: 'USER_ID_REQUIRED',
        message: 'Informe a identidade no cabeçalho X-User-Id.',
      },
    });
  }

  req.userId = userId;
  next();
}

function upload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: 'FILE_REQUIRED',
        message: 'Envie um arquivo no campo "file".',
      },
    });
  }

  try {
    const document = documentsService.createDocument(req.file, req.userId);
    const { storageName, ...publicDocument } = document;
    res.status(201).json(publicDocument);
  } catch (error) {
    next(error);
  }
}

function list(req, res, next) {
  try {
    res.json(documentsService.listDocuments(req.userId));
  } catch (error) {
    next(error);
  }
}

function download(req, res, next) {
  try {
    const result = documentsService.findDownloadForOwner(req.params.id, req.userId);
    if (!result) {
      return res.status(404).json({
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Documento não encontrado.',
        },
      });
    }

    res.download(result.filePath, result.document.originalName, (error) => {
      if (error) next(error);
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  download,
  list,
  requireUser,
  upload,
  uploadMiddleware: documentsService.uploadMiddleware,
};