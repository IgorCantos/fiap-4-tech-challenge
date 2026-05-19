# Saúde da Mulher com IA — Análise de Exercícios por Vídeo

Esse projeto é uma prova de conceito que usa visão computacional e inteligência artificial para acompanhar exercícios fisioterapêuticos em tempo real usando a webcam.

A ideia aqui não é substituir fisioterapeutas ou realizar diagnósticos. O objetivo é mostrar como IA e pose estimation podem ajudar no acompanhamento de movimentos, contagem de exercícios e organização de rotinas de reabilitação.

A aplicação utiliza um modelo YOLO de detecção de pose humana para identificar pontos do corpo e acompanhar movimentos automaticamente.

O projeto começou como um notebook experimental (`fisioterapia.ipynb`) e evoluiu para uma aplicação web completa usando Streamlit e Docker.

A aplicação principal roda pelo arquivo:

```bash
app.py
```

---

# Objetivo

O foco do projeto é demonstrar como visão computacional pode ser aplicada em um cenário de fisioterapia e recuperação funcional.

A solução acompanha exercícios pela câmera e fornece feedback visual em tempo real sobre:

- exercício atual
- quantidade de repetições
- progresso da execução

Hoje o sistema acompanha automaticamente 3 exercícios:

- Elevação Lateral
- Ponte
- Agachamento

Cada exercício possui uma meta de 5 repetições. Quando a meta é atingida, o sistema avança automaticamente para o próximo exercício.

---

# Tecnologias utilizadas

A aplicação foi construída utilizando:

- `Python`
- `Streamlit`
- `streamlit-webrtc`
- `Ultralytics`
- `YOLO11 Pose`
- `OpenCV`
- `NumPy`
- `Docker`
- `Docker Compose`

---

# Modelo utilizado

O projeto utiliza o modelo:

```bash
yolo11s-pose.pt
```

Esse modelo é responsável por detectar os keypoints do corpo humano, como:

- ombros
- punhos
- quadril
- joelhos

A partir desses pontos, a aplicação consegue interpretar os movimentos realizados pela pessoa na frente da câmera.

---

# Estrutura do projeto

```bash
.
├── app.py
├── fisioterapia.ipynb
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── yolo11s-pose.pt
```

---

# Como executar com Docker

A forma mais simples de rodar o projeto é usando Docker.

## Pré-requisitos

Você precisa ter instalado:

- Docker
- Docker Compose

---

## Subindo a aplicação

Entre na pasta do projeto e execute:

```bash
docker-compose up --build
```

O Docker irá:

- baixar dependências
- criar a imagem
- iniciar os containers

Depois disso, acesse no navegador:

```bash
http://localhost:8501
```

Quando abrir:

1. Clique em `START`
2. Permita acesso à webcam
3. O processamento começará automaticamente

---

# Como parar a aplicação

```bash
docker-compose down
```

---

# Funcionamento interno

A aplicação captura os frames da webcam em tempo real e envia cada frame para o modelo YOLO Pose.

O modelo retorna coordenadas dos pontos do corpo humano.

Exemplo:

- ombro
- punho
- quadril
- joelho

A partir dessas coordenadas, o sistema aplica regras simples para detectar movimentos e contar repetições.

A lógica funciona como uma máquina de estados:

```text
baixo -> alto -> baixo = 1 repetição
```

Ou seja:

- movimento sobe
- atinge a posição esperada
- retorna
- repetição contabilizada

---

# Exercícios monitorados

## Elevação lateral

Nesse exercício, o sistema compara a posição do punho em relação ao ombro.

Quando o punho sobe acima da linha do ombro:
- o movimento entra no estado "alto"

Quando o braço desce:
- a repetição é contabilizada

---

## Ponte

A aplicação acompanha a posição vertical do quadril.

Quando o quadril sobe acima do limite esperado:
- o movimento é considerado válido

Quando retorna:
- a repetição é registrada

---

## Agachamento

O sistema também acompanha o eixo vertical do quadril.

Quando o usuário desce:
- o sistema entra no estado do exercício

Quando sobe novamente:
- a repetição é contabilizada

---

# Interface da aplicação

Durante a execução, a interface mostra:

- keypoints desenhados na tela
- exercício atual
- quantidade de repetições
- progresso da série

Tudo acontece em tempo real pela webcam.

---

# Limitações atuais

Como isso ainda é uma prova de conceito, existem algumas limitações importantes:

- os limiares usam pixels fixos
- a análise depende muito da posição da câmera
- não existe avaliação biomecânica
- não mede qualidade do movimento
- não calcula ângulos articulares
- não há suporte para múltiplas pessoas
- pode existir latência dependendo da máquina

Além disso:

> O projeto NÃO substitui acompanhamento profissional de fisioterapeutas ou profissionais da saúde.

---

# Possíveis melhorias futuras

Algumas melhorias que poderiam evoluir bastante o projeto:

- cálculo de ângulos articulares
- validação de postura
- análise biomecânica
- histórico de sessões
- geração de relatórios
- calibração automática
- exercícios personalizados
- múltiplos usuários
- análise qualitativa do movimento

---

# Conclusão

Esse projeto foi criado para explorar aplicações reais de IA e visão computacional em exercícios fisioterapêuticos e recuperação funcional.

Além da parte técnica envolvendo pose estimation, o projeto também serviu para explorar:

- processamento em tempo real
- integração webcam + IA
- aplicações web com Streamlit
- containerização com Docker

Mesmo sendo uma prova de conceito, o projeto mostra como modelos modernos de visão computacional conseguem interpretar movimentos humanos de forma relativamente simples e acessível.
