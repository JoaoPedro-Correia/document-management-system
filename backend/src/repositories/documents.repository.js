const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const storageDirectory = path.resolve(
  process.env.STORAGE_DIR || path.join(__dirname, '../../storage'),
);
const configuredLimit = Number(process.env.MAX_FILE_SIZE_BYTES);
const maxFileSizeBytes = configuredLimit > 0 ? configuredLimit : 10 * 1024 * 1024;
const documents = new Map();

fs.mkdirSync(storageDirectory, { recursive: true });

const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => callback(null, storageDirectory),
    filename: (req, file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: maxFileSizeBytes, files: 1 },
}).single('file');

function saveDocument(file, owner) {
  const document = {
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
  };

  documents.set(document.id, document);
  return { ...document };
}

function findDocumentsByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
    .map(({ storageName, ...document }) => ({ ...document }));
}

function findDocumentById(id) {
  const document = documents.get(id);
  return document ? { ...document } : null;
}

function getFilePath(document) {
  return path.join(storageDirectory, document.storageName);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = {
  fileExists,
  findDocumentById,
  findDocumentsByOwner,
  getFilePath,
  saveDocument,
  uploadMiddleware,
};