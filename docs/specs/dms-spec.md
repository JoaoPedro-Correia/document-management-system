# Especificação - Document Management System

## 1. Objetivo

Permitir o envio, a listagem e o download de documentos associados a uma identidade, usando armazenamento local de arquivos e metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Envio de um arquivo por requisição.
- Listagem dos documentos associados à identidade informada.
- Download de um documento pelo identificador, limitado à identidade associada.
- Interface web para informar uma identidade, enviar arquivos, consultar a lista e baixar documentos.
- Gravação dos arquivos no filesystem local da aplicação.
- Manutenção dos metadados em memória durante a execução do backend.

### Fora do escopo

- Autenticação, cadastro de contas ou autorização robusta.
- Armazenamento externo ou em nuvem.
- Persistência dos metadados após reiniciar o backend.
- Versionamento, exclusão, edição, compartilhamento ou busca avançada.
- Envio de múltiplos arquivos em uma única requisição.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo usando `multipart/form-data` no campo `file`. |
| RF-02 | O backend deve gerar um identificador único e um nome interno para armazenar o arquivo. |
| RF-03 | O backend deve registrar os metadados do documento e associá-los à identidade enviada no cabeçalho `X-User-Id`. |
| RF-04 | O usuário pode listar somente os documentos associados à identidade informada. |
| RF-05 | O usuário pode baixar um documento pelo identificador se ele estiver associado à identidade informada. |
| RF-06 | O backend deve rejeitar requisições sem identidade ou sem arquivo, campos de arquivo inesperados e arquivos maiores que o limite configurado. |
| RF-07 | A interface deve apresentar estados de carregamento, lista vazia e erros retornados pela API. |
| RF-08 | Após envio bem-sucedido, a interface deve atualizar a lista e permitir baixar o documento. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados localmente com `multer` e `diskStorage`, por padrão em `backend/storage`. |
| RNF-02 | Os metadados devem permanecer em memória e podem ser perdidos ao reiniciar o processo do backend. |
| RNF-03 | O nome recebido do cliente não deve ser usado como caminho de armazenamento. |
| RNF-04 | A API deve responder erros em JSON no formato `{ "error": { "code": "...", "message": "..." } }`. |
| RNF-05 | A configuração deve ser fornecida por variáveis de ambiente. |
| RNF-06 | O frontend deve acessar a API pelo prefixo `/api`; o proxy de desenvolvimento do Vite remove esse prefixo ao encaminhar a requisição. |
| RNF-07 | A identidade `X-User-Id` é apenas um mecanismo de associação e não autentica usuários. A API não deve ser exposta publicamente sem autenticação e autorização apropriadas. |

### Configuração

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | `backend/storage` | Diretório local de arquivos; caminhos relativos são resolvidos a partir do diretório de execução do backend. |
| `MAX_FILE_SIZE_BYTES` | `10485760` | Tamanho máximo de cada arquivo em bytes (10 MiB). |

O arquivo `backend/.env.example` contém valores sugeridos. O backend não carrega esse arquivo automaticamente; o ambiente de execução deve fornecer as variáveis.

## 5. Modelo de dados

### Metadados do documento

| Campo | Tipo | Exposição | Descrição |
| --- | --- | --- | --- |
| `id` | string | API | Identificador único gerado pelo backend. |
| `originalName` | string | API | Nome original fornecido pelo cliente, usado para exibição e download. |
| `size` | number | API | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | API | Data e hora do upload em ISO 8601. |
| `owner` | string | API | Identidade associada, recebida em `X-User-Id`. |
| `storageName` | string | Interno | Nome gerado pelo servidor para localizar o arquivo no diretório local. |

## 6. Contratos de API

As rotas são chamadas diretamente no backend. No frontend, usar `/api` como prefixo, por exemplo, `/api/documents`.

### `POST /upload`

- Cabeçalho obrigatório: `X-User-Id`.
- Entrada: `multipart/form-data` com exatamente um arquivo no campo `file`.
- Sucesso: `201 Created`, com os metadados públicos do documento em JSON. `storageName` não deve ser retornado.
- Erros: `400 Bad Request` para identidade ausente, arquivo ausente ou campo inválido; `413 Payload Too Large` quando o arquivo ultrapassar o limite; `500 Internal Server Error` para falhas inesperadas de armazenamento.

### `GET /documents`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, com uma lista JSON dos documentos associados à identidade. Sem documentos, retorna `[]`.
- Erros: `400 Bad Request` para identidade ausente; `500 Internal Server Error` para falhas inesperadas.

### `GET /documents/:id/download`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, com o conteúdo binário e o nome original no cabeçalho de download.
- Erros: `400 Bad Request` para identidade ausente; `404 Not Found` se o documento não existir, pertencer a outra identidade ou não estiver disponível no filesystem; `500 Internal Server Error` para falhas inesperadas de leitura.

### `GET /health`

- Sucesso: `200 OK`, com `{ "status": "ok" }`.

### Formato de erro

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "O arquivo excede o limite permitido."
  }
}
```

## 7. Decisões arquiteturais

- Backend em Node.js e Express, usando CommonJS e separação em `routes/`, `controllers/`, `services/` e `repositories/`.
- Fluxo de dependência: `routes -> controllers -> services -> repositories`.
- `routes/` registra os endpoints; `controllers/` trata HTTP; `services/` aplica regras de negócio; `repositories/` trata armazenamento local e metadados em memória.
- Upload por `multer` com `diskStorage`; nomes internos são gerados pelo servidor.
- Frontend React com componentes funcionais e Hooks. As chamadas HTTP ficam em `frontend/src/services/` e usam `fetch`.
- A identidade de demonstração fica no navegador e é enviada em `X-User-Id`. Isso não substitui autenticação.
- Ao reiniciar o backend, os metadados em memória são perdidos. Arquivos podem permanecer no disco sem referência recuperável pela API.

## 8. Critérios de aceite

- Um upload válido retorna `201` e metadados sem o caminho interno do arquivo.
- Arquivos acima do limite configurado retornam `413` com erro JSON.
- A listagem retorna somente os documentos da identidade enviada.
- O download funciona para o dono associado e retorna `404` para documento inexistente ou associado a outra identidade.
- A interface permite trocar a identidade, enviar um documento, ver a listagem e iniciar o download.
- O endpoint `/health` continua disponível.
- A suíte de testes do backend e o build de produção do frontend concluem sem erros.

## 9. Plano de execução

1. Implementar os contratos e as rotas do backend, mantendo o endpoint de saúde existente.
2. Implementar armazenamento local, metadados em memória e regras de associação por identidade.
3. Adicionar testes para upload, listagem, download, isolamento entre identidades e validação de erros.
4. Construir os componentes React e o serviço `fetch` para integrar upload, listagem e download.
5. Documentar configuração e execução; validar com `cd backend && npm test` e `cd frontend && npm run build`.