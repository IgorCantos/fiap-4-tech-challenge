# FIAP 4 Tech Challenge

Monorepo com frontend Next.js e backend Flask para análise de áudio.

## Estrutura do repositório

```
fiap-4-tech-challenge/
├── frontend/     # Next.js (UI + API routes)
├── backend/      # Flask (análise de áudio com ML)
└── *.ipynb       # Notebooks de exploração
```

## Como rodar

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python app.py
```

Servidor: [http://localhost:5000](http://localhost:5000)

### Frontend

Requer **Node.js 20** (`node -v` → `v20.x.x`).

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

### Docker (recomendado)

Na raiz do repositório, com [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado:

```bash
docker compose up --build
```

Na **primeira subida**, o frontend roda `npm ci` e o backend valida/instala pacotes Python no entrypoint (o volume `node_modules` começa vazio e não usa o da imagem). Isso pode levar alguns minutos.

Isso sobe três serviços:

| Serviço   | URL                         | Descrição                          |
|-----------|-----------------------------|------------------------------------|
| frontend  | http://localhost:3000       | Next.js (Node.js 20, `npm ci`)      |
| backend   | http://localhost:5000       | Flask (Python 3.10) + modelos ML   |
| ollama    | http://localhost:11434      | LLM `gemma3:1b` para análise       |

A primeira execução pode demorar (download de imagens, modelos PyTorch/Hugging Face e Ollama). O cache fica em `backend/model_cache` e no volume Docker do Ollama.

Comandos úteis:

```bash
docker compose up --build -d   # em segundo plano
docker compose logs -f backend
docker compose down
```

## Documentação

- [frontend/README.md](frontend/README.md)
- [backend/README.md](backend/README.md)
