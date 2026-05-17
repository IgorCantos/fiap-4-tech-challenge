# Frontend (Next.js)

Interface Next.js para gravação e análise de áudio.

**Node.js 20 LTS** é a versão recomendada (requerida pelo Next.js 14 e pelo Docker).

Verifique com `node -v` (deve ser `v20.x.x`). Com [nvm](https://github.com/nvm-sh/nvm): `nvm use` na pasta `frontend` (lê o arquivo `.nvmrc`).

## Setup

```bash
cd frontend
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

O backend Flask deve estar rodando em `http://localhost:5000` (veja `../backend/README.md`).

### Docker

O `entrypoint.sh` executa `npm ci` ao iniciar o container (necessário porque o volume montado substitui o `node_modules` da imagem). Na primeira vez, aguarde o download dos pacotes nos logs.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm start` — servidor de produção
- `npm run lint` — ESLint

## Estrutura

```
frontend/
├── app/
│   ├── api/              # Rotas API do Next.js
│   ├── audio-recording/  # Página de gravação
│   ├── layout.tsx
│   └── page.tsx
├── recordings/           # Gravações salvas localmente
├── package.json
└── next.config.js
```
