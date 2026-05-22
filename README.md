# Custom New Tab Dashboard

## Desenvolvimento

### Subir frontend + backend juntos
```bash
npm install
npm run dev
```

### Rodar separado
```bash
npm run dev:frontend
npm run dev:backend
```

### Iniciar modo start (preview + API)
```bash
npm run start:frontend
npm run start:backend
```

## URLs
- Frontend: http://localhost:4177
- Backend: http://localhost:4178
- Healthcheck: http://localhost:4178/api/health
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
