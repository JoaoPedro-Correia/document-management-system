import { useState } from 'react';
import { downloadDocument } from '../services/documents.api';

export default function DownloadButton({ document, userId }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError('');
    try {
      await downloadDocument(document, userId);
    } catch (error) {
      setError(error.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="download-action">
      <button
        className="secondary"
        type="button"
        disabled={!userId || downloading}
        onClick={handleDownload}
        aria-label={`Baixar ${document.originalName}`}
      >
        {downloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}