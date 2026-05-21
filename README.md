# Custom New Tab Dashboard

## Rodando o projeto

### Frontend + Backend juntos
```bash
npm install
npm run dev
```

### Separado
```bash
npm run dev:frontend
npm run dev:backend
```

### Backend isolado
```bash
cd backend
npm install
npm run dev
```

## URLs
- Frontend: http://localhost:4177
- Backend: http://localhost:4178
- Config API: http://localhost:4178/api/config

## Persistência (sem banco de dados)
- Config principal: `backend/data/config.json`
- Config padrão: `backend/data/default-config.json`
- Backup: `backend/data/config.backup.json`
- Histórico: `backend/data/history/`
- Uploads: `backend/uploads/backgrounds` e `backend/uploads/icons`

## Backup manual
1. Copie `backend/data/config.json`
2. Copie a pasta `backend/uploads`

Não há MySQL/SQLite/banco de dados nesta arquitetura.
