import DownloadButton from './DownloadButton';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});
const sizeFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${sizeFormatter.format(bytes / 1024)} KB`;
  return `${sizeFormatter.format(bytes / (1024 * 1024))} MB`;
}

export default function DocumentList({ documents, userId, loading, error, onRefresh }) {
  return (
    <section aria-labelledby="documents-title" aria-busy={loading}>
      <div className="section-heading">
        <h2 id="documents-title">Meus documentos <span className="count">{documents.length}</span></h2>
        <button className="secondary" type="button" onClick={onRefresh} disabled={!userId || loading}>
          Atualizar
        </button>
      </div>
      {error ? <p className="error" role="alert">{error}</p> : loading ? (
        <p className="empty-state" role="status">Carregando documentos...</p>
      ) : !userId ? (
        <p className="empty-state">Nenhum usuário selecionado.</p>
      ) : documents.length === 0 ? (
        <p className="empty-state">Nenhum documento encontrado.</p>
      ) : (
        <ul className="document-list">
          {documents.map((document) => (
            <li className="document-row" key={document.id}>
              <div className="document-details">
                <h3>{document.originalName}</h3>
                <p>{formatSize(document.size)} <span aria-hidden="true"> / </span> {dateFormatter.format(new Date(document.uploadedAt))}</p>
              </div>
              <DownloadButton document={document} userId={userId} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}