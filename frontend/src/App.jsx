import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documents.api';
import './App.css';

export default function App() {
  const [userInput, setUserInput] = useState('');
  const [userId, setUserId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  function refreshDocuments() {
    setRevision((current) => current + 1);
  }

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    listDocuments(userId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setDocuments(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [userId, revision]);

  function handleUserSubmit(event) {
    event.preventDefault();
    const nextUserId = userInput.trim();
    if (!nextUserId || nextUserId === userId) return;
    setDocuments([]);
    setError('');
    setLoading(true);
    setUserId(nextUserId);
  }

  return (
    <main>
      <header className="page-header">
        <p className="brand">DMS / ARQUIVO DIGITAL</p>
        <h1>Documentos</h1>
        <form className="user-form" onSubmit={handleUserSubmit}>
          <label htmlFor="user-id">Identificação do usuário</label>
          <div className="user-controls">
            <input id="user-id" value={userInput} onChange={(event) => setUserInput(event.target.value)} required />
            <button type="submit" disabled={!userInput.trim() || userInput.trim() === userId}>Selecionar</button>
          </div>
        </form>
        {userId && <p className="active-user">Usuário atual: <strong>{userId}</strong></p>}
      </header>
      <UploadComponent key={userId} userId={userId} onUploaded={refreshDocuments} />
      <DocumentList
        documents={documents}
        userId={userId}
        loading={loading}
        error={error}
        onRefresh={refreshDocuments}
      />
    </main>
  );
}
