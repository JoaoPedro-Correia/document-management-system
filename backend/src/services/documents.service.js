const documentsRepository = require('../repositories/documents.repository');

function createDocument(file, owner) {
  return documentsRepository.saveDocument(file, owner);
}

function listDocuments(owner) {
  return documentsRepository.findDocumentsByOwner(owner);
}

function findDownloadForOwner(id, owner) {
  const document = documentsRepository.findDocumentById(id);
  if (!document || document.owner !== owner) {
    return null;
  }

  const filePath = documentsRepository.getFilePath(document);
  if (!documentsRepository.fileExists(filePath)) {
    return null;
  }

  return { document, filePath };
}

module.exports = {
  createDocument,
  findDownloadForOwner,
  listDocuments,
  uploadMiddleware: documentsRepository.uploadMiddleware,
};