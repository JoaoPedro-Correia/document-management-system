import { useState } from 'react';
import { uploadDocument } from '../services/documents.api';

export default function UploadComponent({ userId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading || !userId) return;
    const form = event.currentTarget;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await uploadDocument(file, userId);
      form.reset();
      setFile(null);
      setSuccess('Documento enviado com sucesso.');
      onUploaded();
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <h2 id="upload-title">Enviar documento</h2>
      <form onSubmit={handleSubmit} aria-busy={uploading}>
        <label htmlFor="document-file">Arquivo</label>
        <div className="upload-controls">
          <input
            id="document-file"
            name="file"
            type="file"
            required
            disabled={!userId || uploading}
            onChange={(event) => {
              setFile(event.target.files[0] || null);
              setError('');
              setSuccess('');
            }}
          />
          <button type="submit" disabled={!userId || !file || uploading}>
            {uploading ? 'Enviando...' : 'Enviar documento'}
          </button>
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {success && <p className="success" role="status">{success}</p>}
    </section>
  );
}