# Backend — Análise de Áudio para Acompanhamento Clínico

API Flask que recebe um arquivo de áudio (geralmente WebM gravado no navegador), processa o sinal com vários modelos de machine learning e devolve transcrição, emoção vocal, características acústicas e um relatório textual gerado por LLM.

> **Aviso:** este sistema é **auxiliar**. Não realiza diagnóstico médico. A saída da LLM é instruída a evitar conclusões clínicas e termos técnicos na resposta final.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Fluxo do pipeline (Mermaid)](#fluxo-do-pipeline-mermaid)
3. [Arquitetura do código](#arquitetura-do-código)
4. [Modelos e componentes](#modelos-e-componentes)
5. [API HTTP](#api-http)
6. [Formato da resposta](#formato-da-resposta)
7. [Requisitos e ambiente](#requisitos-e-ambiente)
8. [Como executar](#como-executar)
9. [Variáveis de ambiente](#variáveis-de-ambiente)
10. [Cache e armazenamento](#cache-e-armazenamento)
11. [Limitações conhecidas](#limitações-conhecidas)

---

## Visão geral

O backend implementa um **pipeline multimodal** sobre áudio de voz:

| Etapa | Tecnologia | Saída |
|-------|------------|--------|
| Decodificação | PyAV + resample | Array NumPy mono 16 kHz |
| Pré-processamento | Normalização de amplitude | Áudio escalado em [-1, 1] |
| Detecção de fala | Silero VAD | Segmentos com voz (ou erro) |
| Transcrição | Faster-Whisper `small` | Texto em português |
| Emoção vocal | Wav2Vec2 (Audeering) | Rótulo + score de confiança |
| Prosódia | openSMILE eGeMAPSv02 | Loudness, pitch, MFCC1, alpha ratio |
| Síntese clínica | Ollama `gemma3:1b` | Relatório em linguagem natural |

Todos os modelos rodam **localmente** (CPU no Whisper com `int8`; demais via PyTorch/Transformers). O Ollama é um **serviço separado** (porta 11434) acessado pela biblioteca `ollama` Python.

---

## Fluxo do pipeline (Mermaid)

```mermaid
flowchart TB
    subgraph Cliente
        A[Frontend grava WebM] --> B[POST /api/audio multipart]
    end

    subgraph API["Flask — routes/audio_route.py"]
        B --> C{Campo audio presente?}
        C -->|Não| E400[400 Bad Request]
        C -->|Sim| D[load_audio_from_bytes]
    end

    subgraph Preprocessamento["utils/audio_loader.py"]
        D --> D1[PyAV: decode WebM/OGG/WAV]
        D1 --> D2[Resample mono 16 kHz float32]
        D2 --> D3[normalize_audio amplitude]
    end

    subgraph Pipeline["services/audio_service.py"]
        D3 --> VAD[Silero VAD]
        VAD --> VADc{Fala detectada?}
        VADc -->|Não| ERR[Retorno: error + emotion inconclusiva]
        VADc -->|Sim| W[Whisper small — transcrição PT]
        W --> EM[wav2vec2 emotion — rótulo + score]
        EM --> EMc{score >= 0.4?}
        EMc -->|Não| EML[emotion = inconclusiva]
        EMc -->|Sim| EMO[emotion = top label]
        EML --> SM
        EMO --> SM[openSMILE eGeMAPSv02 — 4 features]
        SM --> LLM[Ollama gemma3:1b — fusão textual]
    end

    subgraph Resposta
        LLM --> OK[200 JSON: transcription, emotion, audio_features, analysis]
        ERR --> E500[500 com mensagem de erro]
    end

    B -.-> E400
```

### Sequência simplificada (temporal)

```mermaid
sequenceDiagram
    participant F as Frontend
    participant R as audio_route
    participant L as audio_loader
    participant S as audio_service
    participant M as model_loader
    participant O as Ollama

    F->>R: POST /api/audio (audio.webm)
    R->>L: load_audio_from_bytes(bytes)
    L-->>R: audio_np float32 16kHz
    R->>S: analyze_audio(audio_np)
    S->>M: get_vad_model / whisper / emotion / smile
    S->>S: VAD → Whisper → Emotion → openSMILE
    S->>O: chat(gemma3:1b, prompt fusão)
    O-->>S: analysis (texto)
    S-->>R: dict resultado
    R-->>F: JSON 200
```

---

## Arquitetura do código

```
backend/
├── app.py                    # Flask app, CORS, cache HF, load_models no __main__
├── entrypoint.sh             # Docker: pip, espera Ollama, pull gemma3:1b
├── Dockerfile
├── requirements.txt
├── model_cache/              # Download Hugging Face / Whisper (gitignored)
├── routes/
│   └── audio_route.py        # POST /api/audio — validação HTTP e JSON
├── services/
│   └── audio_service.py      # Pipeline completo de análise
└── utils/
    ├── audio_loader.py       # PyAV decode + normalização
    └── model_loader.py       # Singleton dos modelos + ensure_ollama_model
```

| Camada | Responsabilidade |
|--------|------------------|
| `routes/` | Protocolo HTTP, status codes, serialização JSON |
| `services/` | Orquestração do pipeline ML e prompt da LLM |
| `utils/` | I/O de áudio e ciclo de vida dos modelos |

Os modelos são carregados **uma vez** (`load_models()`), com `threading.Lock`, na primeira requisição ou ao iniciar `python app.py`.

---

## Modelos e componentes

### 1. PyAV — decodificação de áudio (não é modelo ML)

| Item | Detalhe |
|------|---------|
| **Pacote** | `av==12.1.0` |
| **Onde** | `utils/audio_loader.py` → `load_audio_from_bytes()` |
| **Por quê** | O navegador envia **WebM** (Opus). PyAV decodifica containers variados sem depender de arquivo em disco. |
| **Responsabilidade** | Ler bytes → frames de áudio → **mono**, **16 kHz**, `float32` (padrão para VAD, Whisper e Wav2Vec2). |
| **Saída** | `numpy.ndarray` 1D |

Após o decode, `normalize_audio()` divide pelo pico absoluto para estabilizar amplitude entre gravações.

---

### 2. Silero VAD — detecção de atividade de voz

| Item | Detalhe |
|------|---------|
| **Modelo** | [Silero VAD](https://github.com/snakers4/silero-vad) (via `silero-vad==5.1.2`) |
| **Carregamento** | `load_silero_vad()` em `model_loader.py` |
| **Uso** | `get_speech_timestamps(audio_np, vad_model, sampling_rate=16000)` |
| **Por quê** | Evita transcrever/analisar áudio **sem fala** (silêncio, ruído só, microfone mudo). Reduz custo e falsos positivos. |
| **Responsabilidade** | Responder: *existe voz humana neste áudio?* |
| **Se falhar** | Retorno antecipado: `error: No speech detected in audio`, `emotion: inconclusiva`. |

O VAD **não corta** o áudio antes do Whisper; apenas valida presença de fala. A transcrição usa o áudio completo.

---

### 3. Faster-Whisper `small` — transcrição (ASR)

| Item | Detalhe |
|------|---------|
| **Modelo** | `small` ([Systran/faster-whisper-small](https://huggingface.co/Systran/faster-whisper-small)) |
| **Biblioteca** | `faster-whisper==1.0.3` (implementação CTranslate2 do OpenAI Whisper) |
| **Configuração** | `device="cpu"`, `compute_type="int8"`, `language="pt"`, `download_root=model_cache` |
| **Por quê** | Boa qualidade em **português** com custo moderado em CPU; `int8` reduz RAM e tempo vs. float32. |
| **Responsabilidade** | Gerar **transcrição literal** do que foi dito — base para coerência texto/voz e para o prompt da LLM. |
| **Saída** | `transcription` (string concatenada dos segmentos) |

O Whisper não classifica emoção; apenas converte fala em texto.

---

### 4. Wav2Vec2 Emotion — classificação emocional da voz

| Item | Detalhe |
|------|---------|
| **Modelo** | [`audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim`](https://huggingface.co/audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim) |
| **Biblioteca** | `transformers` → `pipeline("audio-classification", ...)` |
| **Treino** | Fine-tune em **MSP-Podcast** (emoções dimensionais/categóricas em áudio real de podcast) |
| **Por quê** | Modelo **especializado em emoção a partir do áudio**, mais adequado que derivar emoção só do texto. |
| **Responsabilidade** | Estimar **rótulo emocional dominante** e **score** (confiança da classe vencedora). |
| **Regra de negócio** | Se `score < 0.4` → `emotion = "inconclusiva"` (sinal fraco / ambíguo). |
| **Saída** | `emotion`, `emotion_confidence` |

Os rótulos exatos dependem do cabeçalho do modelo no Hugging Face (ex.: dimensões arousal/valence ou classes agregadas). O código usa o item de **maior score** do pipeline.

---

### 5. openSMILE eGeMAPSv02 — características acústicas (prosódia)

| Item | Detalhe |
|------|---------|
| **Ferramenta** | `opensmile==2.6.0` |
| **Feature set** | `eGeMAPSv02` (extended Geneva Minimalistic Acoustic Parameter Set) |
| **Nível** | `Functionals` (estatísticas agregadas no trecho inteiro) |
| **Por quê** | Features **interpretáveis** e usadas em pesquisa de paralinguística — complementam emoção “black-box” do Wav2Vec2 com medidas de intensidade, tom e timbre. |
| **Responsabilidade** | Extrair descritores numéricos enviados **apenas ao prompt da LLM** (não expostos diretamente ao usuário final nas regras do prompt). |

| Feature extraída | Coluna openSMILE | Significado aproximado |
|------------------|------------------|-------------------------|
| Intensidade vocal | `loudness_sma3_amean` | Energia / “volume” médio da voz |
| Tom / altura | `F0semitoneFrom27.5Hz_sma3nz_amean` | Fundamental (F0) em semitons — proxy de tom |
| Padrão espectral | `mfcc1_sma3_amean` | 1º MFCC — timbre / qualidade do tracto vocal |
| Estabilidade / espectro | `alphaRatioV_sma3nz_amean` | Relação energia baixa/alta frequência na voz |

Valores ficam em `audio_features` no JSON de resposta (úteis para debug/API); o prompt da LLM é instruído a **não repetir números** no texto `analysis`.

---

### 6. Ollama `gemma3:1b` — fusão e relatório em linguagem natural

| Item | Detalhe |
|------|---------|
| **Modelo** | `gemma3:1b` (Google Gemma 3, ~1B parâmetros, via [Ollama](https://ollama.com)) |
| **Constante** | `LLM_MODEL = "gemma3:1b"` em `model_loader.py` |
| **Cliente** | `ollama==0.6.0` → `ollama.chat(...)` |
| **Por quê** | Roda **local**, leve o suficiente para demo/tech challenge, gera texto em **português** e integra múltiplos sinais num único parecer legível. |
| **Responsabilidade** | **Fusão** de transcrição + emoção + features acústicas em relatório com 4 seções, tom clínico-descritivo, sem diagnóstico. |
| **Hiperparâmetros** | `temperature=0.3`, `num_predict=512` (respostas mais estáveis e limitadas) |
| **System prompt** | `"Você é um analisador emocional clínico."` |
| **Regras no user prompt** | Proibir diagnósticos, números, markdown, emojis; obrigar estrutura numerada 1–4 + disclaimer final |

A LLM **não reexecuta** ML: apenas interpreta os outputs já calculados.

---

### 7. Modelo carregado mas não usado no pipeline atual

| Modelo | Hugging Face | Situação |
|--------|--------------|----------|
| **Análise de sentimento textual** | `tabularisai/multilingual-sentiment-analysis` | Carregado em `load_models()` como `text_sentiment`, exposto por `get_text_sentiment()`, **não chamado** em `audio_service.py`. |

**Motivo provável:** preparação para fusão texto + áudio (sentimento da transcrição vs. emoção vocal). Hoje só a emoção **acústica** e o texto bruto da transcrição entram no fluxo (o texto vai à LLM, não ao classificador de sentimento).

Para ativar no futuro: após o Whisper, rodar `text_sentiment(full_text)` e incluir o resultado no `fusion_prompt`.

---

## API HTTP

### `POST /api/audio`

Recebe áudio em `multipart/form-data`.

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `audio` | arquivo | Sim |

**Exemplo (curl):**

```bash
curl -X POST http://localhost:5000/api/audio \
  -F "audio=@gravacao.webm"
```

**Respostas:**

| Status | Condição |
|--------|----------|
| `200` | Análise concluída |
| `400` | Sem arquivo ou nome vazio |
| `500` | Sem fala detectada, erro de processamento ou exceção |

---

## Formato da resposta

### Sucesso (`200`)

```json
{
  "message": "Audio analyzed successfully",
  "timestamp": "2026-05-17T12:00:00.000000",
  "analysis": {
    "transcription": "texto transcrito em português",
    "emotion": "neutral",
    "emotion_confidence": 0.72,
    "audio_features": {
      "loudness": 0.85,
      "pitch": 21.3,
      "mfcc1": -5.1,
      "alpha_ratio": 0.42
    },
    "analysis": "1. PADRÕES EMOCIONAIS OBSERVADOS\n..."
  }
}
```

### Erro sem fala (`500`)

```json
{
  "error": "No speech detected in audio",
  "timestamp": "2026-05-17T12:00:00.000000"
}
```

---

## Requisitos e ambiente

| Requisito | Versão / nota |
|-----------|----------------|
| **Python** | **3.10** (recomendado; ver `.python-version`) |
| **Ollama** | Serviço com modelo `gemma3:1b` disponível |
| **RAM** | ≥ 8 GB recomendado (vários modelos em CPU) |
| **Disco** | Espaço para `model_cache/` (Whisper small + Wav2Vec2 + caches HF) |
| **FFmpeg** | Usado indiretamente pelo ecossistema de áudio; no Docker instalado via `apt` |

**Dependências principais** (`requirements.txt`):

- **Web:** Flask 3, Flask-CORS  
- **Áudio:** `av`, `silero-vad`, `opensmile`, `sounddevice`, `soundfile`  
- **ML:** `torch`, `torchaudio`, `faster-whisper`, `transformers`  
- **LLM:** `ollama` (cliente HTTP para o daemon Ollama)
- **Banco de Dados:** `supabase` (cliente oficial Python)

---

## Como executar

### Local (sem Docker)

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt

# Em outro terminal: ollama serve && ollama pull gemma3:1b
python app.py
```

Servidor: `http://localhost:5000`  
Na primeira execução, os modelos são baixados para `backend/model_cache/`.

### Docker (raiz do repositório)

```bash
docker compose up --build
```

O serviço `ollama` sobe junto; o `entrypoint.sh` do backend aguarda a API e puxa `gemma3:1b` se necessário.

---

## Variáveis de ambiente

| Variável | Padrão | Efeito |
|----------|--------|--------|
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | URL do daemon Ollama (`http://ollama:11434` no Docker Compose) |
| `HF_HOME` | `backend/model_cache` | Cache Hugging Face (definido em `app.py`) |
| `TRANSFORMERS_CACHE` | idem | Cache Transformers |
| `TORCH_HOME` | idem | Cache Torch |

---

## Cache e armazenamento

| Caminho | Conteúdo |
|---------|----------|
| `backend/model_cache/` | Pesos Whisper, Wav2Vec2, sentiment (não versionado no Git) |
| Volume Docker `ollama_data` | Modelo `gemma3:1b` no Ollama |

O diretório `model_cache` está no `.gitignore` da raiz do repositório.

---

## Limitações conhecidas

1. **CPU only** no Whisper — latência alta em áudios longos.  
2. **Um único idioma** forçado na transcrição: `language="pt"`.  
3. **Emoção vocal ≠ estado clínico** — o classificador foi treinado em podcast, não em consultório.  
4. **LLM pode alucinar** apesar das restrições do prompt; revisão humana é obrigatória.  
5. **`text_sentiment` ocioso** — consome RAM no boot sem uso no pipeline.  
6. **CORS aberto** — adequado para desenvolvimento; restringir origens em produção.  
7. **Servidor Flask de desenvolvimento** — para produção, usar Gunicorn/uWSGI + reverse proxy.  
8. **Sem autenticação** na rota `/api/audio`.  
9. **VAD não remove silêncio** — Whisper ainda processa o arquivo inteiro após validação.

---

## Diagrama de dependências entre modelos

```mermaid
flowchart LR
    subgraph Entrada
        AU[Áudio WebM]
    end

    subgraph Modelos
        VAD[Silero VAD]
        WH[Whisper small]
        WV[wav2vec2 emotion]
        OS[openSMILE eGeMAPS]
        GM[gemma3:1b]
    end

    AU --> VAD
    VAD --> WH
    VAD --> WV
    VAD --> OS
    WH --> GM
    WV --> GM
    OS --> GM

    GM --> OUT[Relatório analysis]
    WH --> OUT2[transcription]
    WV --> OUT3[emotion + confidence]
    OS --> OUT4[audio_features]
```

---

## Referências rápidas

- [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper)  
- [Silero VAD](https://github.com/snakers4/silero-vad)  
- [Audeering Wav2Vec2 Emotion](https://huggingface.co/audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim)  
- [openSMILE](https://www.audeering.com/research/opensmile/)  
- [Ollama](https://github.com/ollama/ollama)  
- [Gemma](https://deepmind.google/models/gemma/)

---

## Contato com o frontend

O frontend em React com Vite (migrado recentemente) envia um `POST` para `http://localhost:5000/api/audio` (ou `VITE_API_URL`) e exibe os resultados da análise retornados pelo backend.

---

## Supabase (histórico na nuvem)

Após cada análise bem-sucedida, o texto da **LLM** (e metadados) é salvo na tabela `analyses`.

### Configuração

1. No [Supabase SQL Editor](https://supabase.com/dashboard), execute `backend/sql/supabase_schema.sql`.
2. Credenciais em `services/supabase_service.py` (`SUPABASE_URL`, `SUPABASE_KEY`).
3. Reinicie o backend (`python app.py` ou `docker compose up`).

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/analyses?limit=50` | Lista análises salvas (mais recentes primeiro) |

O frontend React consome essa rota na página correspondente de histórico de análises.
