# Frontend (React + Vite)

Interface gráfica para gravação e visualização da análise de áudio.

Recentemente migrada de Next.js para **React puro com Vite** e componentes do **Material UI**.

**Node.js 20 LTS** é a versão recomendada (para compatibilidade com outras partes do projeto e Docker). Verifique com `node -v` (deve ser `v20.x.x`). 

## Setup

```bash
cd frontend
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) (porta padrão do Vite).

> **Aviso:** O backend Flask deve estar rodando simultaneamente em `http://localhost:5000` (veja as instruções na pasta `../backend/README.md`).

## Scripts Disponíveis

- `npm run dev` — Inicia o servidor local de desenvolvimento super-rápido do Vite
- `npm run build` — Transpila o TypeScript e gera a versão otimizada para produção (pasta `dist/`)
- `npm run preview` — Roda localmente o código já compilado para produção (para testes)
- `npm run lint` — Roda o ESLint para garantir a padronização e qualidade do código

## Estrutura do Projeto

```text
frontend/
├── src/
│   ├── components/       # Componentes visuais e de negócio
│   │   ├── AppNav.tsx         # Barra de navegação lateral/superior
│   │   ├── AppShell.tsx       # Container principal da aplicação
│   │   └── AudioRecording.tsx # Motor principal (gravação de áudio e comunicação com a API)
│   ├── pages/            # Telas roteáveis
│   │   └── AnalysesPage.tsx   # Tela de histórico buscando dados do Supabase
│   ├── App.tsx           # Configuração de rotas e providers de tema
│   ├── main.tsx          # Ponto de entrada do React no DOM
│   └── theme.ts          # Tokens e paleta de cores do Material UI
├── package.json
└── vite.config.ts        # Configurações do bundler Vite
```

## Variáveis de Ambiente

O Vite usa o prefixo `VITE_` para expor variáveis de ambiente ao código do navegador. Para customizar a URL da API, você pode criar um arquivo `.env` na pasta `frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```
