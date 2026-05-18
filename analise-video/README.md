# Saúde da Mulher: Análise de Vídeo para Apoio Fisioterapêutico com IA

Este projeto apresenta um protótipo de acompanhamento fisioterapêutico em tempo real voltado ao contexto de saúde da mulher. A proposta é utilizar visão computacional para apoiar a recuperação de movimentos após algum problema físico, como limitações motoras, redução de mobilidade, dores musculoesqueléticas ou processos de reabilitação funcional.

A solução identifica pontos-chave do corpo humano por meio de um modelo YOLO de estimativa de pose e, a partir dessas coordenadas, conta repetições de exercícios previamente definidos. O foco não é substituir o acompanhamento profissional, mas demonstrar como a inteligência artificial pode ser usada como ferramenta complementar para monitoramento, feedback e organização de uma rotina de exercícios.

O projeto foi desenvolvido no arquivo `fisioterapia.ipynb`, onde implementamos a captura da webcam, a aplicação do modelo de pose, a interpretação dos movimentos e a exibição do progresso da usuária em uma interface visual objetiva.

---

# Objetivo

O objetivo do projeto é demonstrar como técnicas de inteligência artificial podem apoiar o monitoramento de exercícios fisioterapêuticos associados à recuperação funcional da mulher. A solução oferece feedback automático sobre a execução de uma sequência de movimentos, permitindo acompanhar repetições e progressão de forma direta.

Dentro do tema de saúde da mulher, o projeto se posiciona como uma prova de conceito para auxiliar rotinas de reabilitação e retomada gradual de mobilidade, especialmente em cenários nos quais o acompanhamento do movimento pode contribuir para adesão, organização e percepção de evolução.

Na versão atual, o sistema acompanha três exercícios:

- Elevação Lateral
- Ponte
- Agachamento

Cada exercício possui meta de 5 repetições. Ao atingir a meta, o sistema avança automaticamente para o próximo exercício.

---

# Tecnologias Utilizadas

A implementação utiliza as seguintes bibliotecas:

- `ultralytics`: responsável por carregar e executar o modelo YOLO de estimativa de pose.
- `opencv-python`: utilizada para capturar vídeo da webcam, desenhar informações na tela e exibir a interface em tempo real.
- `numpy`: utilizada como apoio para manipulação numérica.

O modelo carregado é o `yolo11s-pose.pt`, presente no próprio diretório do projeto. Trata-se de um modelo pré-treinado para detecção de pose humana, capaz de identificar pontos anatômicos como ombros, punhos, quadris e joelhos.

Esses pontos permitem observar movimentos relevantes em exercícios de fortalecimento, mobilidade e controle corporal.

---

# Funcionamento Geral

O funcionamento da solução pode ser resumido em seis etapas principais:

1. Instala e importa as dependências necessárias.
2. Carrega o modelo YOLO de estimativa de pose.
3. Abre a webcam do computador.
4. Processa cada frame do vídeo em tempo real.
5. Extrai pontos corporais da pessoa detectada.
6. Aplica regras de movimento para contar repetições e atualizar a interface.

A aplicação permanece em execução até que o usuário pressione a tecla `q`.

---

# Lógica Interna

O projeto não realiza treinamento de modelo. A inteligência do protótipo está na combinação entre a detecção de pose fornecida pelo YOLO e uma camada de regras implementada para interpretar os movimentos.

Para cada frame capturado, o modelo retorna coordenadas dos pontos corporais detectados. A solução considera a primeira pessoa identificada na imagem e utiliza principalmente os seguintes pontos:

- Ombro
- Punho
- Quadril
- Joelho

Na prática, a contagem dos exercícios é baseada sobretudo na posição vertical desses pontos. Como em imagens digitais o eixo vertical cresce de cima para baixo, valores menores de `y` indicam pontos mais altos na tela, enquanto valores maiores indicam pontos mais baixos.

Essa abordagem foi escolhida por ser interpretável e adequada para um protótipo acadêmico. Ela permite demonstrar a lógica de acompanhamento do movimento sem exigir sensores corporais adicionais.

---

# Controle de Repetições

A implementação usa uma variável de estado para diferenciar as fases do movimento, alternando entre posições como `"baixo"` e `"alto"`.

Esse controle evita que o sistema conte várias repetições enquanto a pessoa permanece parada em uma mesma posição.

A repetição só é contabilizada quando o movimento completa uma transição esperada.

Por exemplo:

- Na Elevação Lateral, o sistema observa se o punho sobe acima do ombro e depois retorna.
- Na Ponte, observa a subida e descida do quadril.
- No Agachamento, observa a variação vertical do quadril entre a posição baixa e a posição de retorno.

Essa abordagem funciona como uma máquina de estados: o sistema identifica uma fase inicial, aguarda a mudança corporal esperada e só então incrementa o contador.

---

# Exercícios Monitorados

## Elevação Lateral

A elevação lateral pode ser associada a exercícios de mobilidade e fortalecimento de membros superiores.

A regra compara a altura do punho com a altura do ombro. Quando o punho ultrapassa a linha do ombro, o movimento é considerado em fase alta. Quando o punho retorna para baixo, uma repetição é contabilizada.

---

## Ponte

A ponte é um exercício frequentemente relacionado ao fortalecimento de quadril, glúteos e estabilidade da região central do corpo.

A regra utiliza a altura do quadril: quando ele sobe acima de um limiar definido, o sistema entende que a ponte foi elevada; quando retorna a uma posição inferior, a repetição é registrada.

---

## Agachamento

O agachamento contribui para fortalecimento de membros inferiores e controle funcional de movimento.

Ele também é avaliado pela altura do quadril. O sistema interpreta a descida e o retorno do quadril como as fases principais do movimento, contabilizando a repetição quando o ciclo é concluído.

---

# Interface

Durante a execução, a aplicação exibe uma janela chamada `Fisioterapia IA`.

Nela, a usuária visualiza:

- A imagem capturada pela webcam
- A pose estimada pelo modelo
- O nome do exercício atual
- O número de repetições realizadas
- A meta de repetições

Essa interface tem caráter demonstrativo, mas já permite acompanhar o comportamento do algoritmo em tempo real e visualizar a progressão da atividade.

---

# Limites da Solução

Como prova de conceito, o projeto cumpre o objetivo de demonstrar a integração entre visão computacional, saúde da mulher e monitoramento de movimento.

Ainda assim, existem limitações importantes:

- Os limiares de movimento são fixos em pixels, o que torna o resultado dependente da distância da câmera, resolução e enquadramento.
- O sistema considera apenas a primeira pessoa detectada no vídeo.
- A avaliação do movimento usa posições verticais, sem cálculo de ângulos articulares.
- Não há validação clínica da postura ou da qualidade biomecânica do movimento.
- O protótipo não substitui avaliação, prescrição ou acompanhamento de profissionais de saúde.

Esses pontos não invalidam o protótipo, mas indicam caminhos claros de evolução para uma versão mais robusta.

---

# Possíveis Evoluções

Para uma aplicação mais adequada a cenários reais de saúde da mulher e fisioterapia, o projeto poderia evoluir com:

- Calibração inicial individual por usuário
- Normalização dos limiares com base nas proporções corporais
- Cálculo de ângulos articulares
- Avaliação de qualidade do movimento, não apenas contagem
- Registro histórico das sessões
- Relatórios de desempenho
- Suporte a diferentes perfis de exercícios
- Personalização de protocolos conforme objetivo de recuperação funcional
- Encerramento automático ao final da sequência

---

# Conclusão

O projeto implementa um protótipo funcional de acompanhamento de exercícios com IA, direcionado ao tema de saúde da mulher.

A solução utiliza YOLO para estimar a pose corporal, OpenCV para processar e exibir o vídeo, e uma lógica baseada em estados para contar repetições.

A abordagem demonstra de forma objetiva como modelos de visão computacional podem ser aplicados ao contexto de saúde, reabilitação e recuperação funcional.

O projeto serve como base inicial para sistemas mais completos de apoio ao acompanhamento fisioterapêutico de mulheres, especialmente se combinado futuramente com critérios biomecânicos, calibração individual, personalização de protocolos e validação experimental.