import unicodedata
import numpy as np
from silero_vad import get_speech_timestamps
import ollama

from utils.audio_loader import normalize_audio
from utils.model_loader import (
    get_whisper_model,
    get_emotion_classifier,
    get_smile,
    get_vad_model,
    to_python_float,
    LLM_MODEL
)


SAMPLE_RATE = 16000


def analyze_audio(audio_np):
    """Analyze audio and return transcription, emotion, and LLM analysis."""
    
    # Normalize audio
    audio_np = normalize_audio(audio_np)
    
    # Get models
    whisper_model = get_whisper_model()
    emotion_classifier = get_emotion_classifier()
    smile = get_smile()
    vad_model = get_vad_model()
    
    # VAD to detect speech
    print("Running VAD...")
    speech_timestamps = get_speech_timestamps(
        audio_np,
        vad_model,
        sampling_rate=SAMPLE_RATE
    )
    
    if len(speech_timestamps) == 0:
        return {
            'error': 'No speech detected in audio',
            'transcription': '',
            'emotion': 'inconclusiva',
            'analysis': 'Não foi detectada fala no áudio.'
        }
    
    # Transcription
    print("Transcribing audio...")
    segments, info = whisper_model.transcribe(audio_np, language="pt")
    full_text = ""
    for segment in segments:
        full_text += segment.text + " "
    full_text = full_text.strip()
    
    # Emotion detection
    print("Detecting emotion...")
    result = emotion_classifier(audio_np, sampling_rate=16000)
    top_emotion = max(result, key=lambda x: x["score"])
    emotion_label = str(top_emotion["label"]).lower()
    emotion_score = float(top_emotion["score"])
    
    if emotion_score < 0.4:
        emotion_label = "inconclusiva"
    
    # OpenSMILE features
    print("Extracting audio features...")
    features = smile.process_signal(audio_np, SAMPLE_RATE)
    
    loudness = None
    pitch = None
    mfcc1 = None
    alpha_ratio = None
    
    if "loudness_sma3_amean" in features.columns:
        loudness = to_python_float(features["loudness_sma3_amean"].values[0])
    if "F0semitoneFrom27.5Hz_sma3nz_amean" in features.columns:
        pitch = to_python_float(features["F0semitoneFrom27.5Hz_sma3nz_amean"].values[0])
    if "mfcc1_sma3_amean" in features.columns:
        mfcc1 = to_python_float(features["mfcc1_sma3_amean"].values[0])
    if "alphaRatioV_sma3nz_amean" in features.columns:
        alpha_ratio = to_python_float(features["alphaRatioV_sma3nz_amean"].values[0])
    
    # Text normalization
    texto_lower = full_text.lower()
    texto_lower = unicodedata.normalize("NFKD", texto_lower).encode("ASCII", "ignore").decode("utf-8")
    
    # LLM analysis
    print("Generating LLM analysis...")
    fusion_prompt = f"""
Você é um sistema auxiliar de análise emocional para acompanhamento clínico de pacientes.

Sua função é realizar apenas uma síntese descritiva e humanizada dos sinais emocionais percebidos na fala e no conteúdo textual.

REGRAS IMPORTANTES:
- NÃO invente informações.
- NÃO faça diagnósticos médicos.
- NÃO afirme doenças, transtornos ou condições clínicas.
- NÃO conclua que o paciente possui depressão, ansiedade ou qualquer patologia.
- Apenas descreva padrões emocionais observáveis presentes nos dados fornecidos.
- Sempre deixe claro que a análise NÃO substitui avaliação médica profissional.
- Utilize apenas os dados recebidos abaixo.
- Não extrapole além das evidências fornecidas.

REGRAS ABSOLUTAS:
- É PROIBIDO exibir:
  - números
  - porcentagens
  - scores
  - métricas
  - valores decimais
  - nomes técnicos
  - nomes de features
  - nomes de variáveis
  - termos de machine learning
- Nunca mencione:
  loudness, pitch, mfcc, alpha_ratio, score, confiança, probabilidade ou valores estatísticos.
- Converta TODOS os dados técnicos em linguagem natural e humana.
- A resposta deve parecer escrita por um profissional clínico humano.
- Nunca cite dados brutos recebidos na entrada.
- Nunca explique métricas.
- Nunca apresente medições numéricas.
- Mesmo que existam números na entrada, eles DEVEM ser ignorados na resposta.
- Caso algum valor técnico seja mencionado, a resposta está incorreta.

REGRAS DE FORMATAÇÃO:
- NÃO converse com o usuário.
- NÃO use frases como:
  "Ok", "Claro", "Vamos nessa", "Entendi", ou similares.
- NÃO faça introduções.
- NÃO use markdown.
- NÃO use emojis.
- A resposta deve começar DIRETAMENTE por:
  "1. PADRÕES EMOCIONAIS OBSERVADOS"
- Responda SOMENTE os tópicos solicitados.

OBJETIVO:
Realizar uma fusão entre:
- características emocionais da voz
- emoção vocal detectada
- intensidade e estabilidade vocal
- padrões da fala
- contexto textual da transcrição

DADOS DISPONÍVEIS:

TRANSCRIÇÃO:
{full_text}

EMOÇÃO VOCAL DETECTADA:
{emotion_label}

DADOS TÉCNICOS INTERNOS (NÃO DEVEM APARECER NA RESPOSTA):
- intensidade vocal: {loudness}
- tom e variação da fala: {pitch}
- características do padrão de fala: {mfcc1}
- estabilidade vocal percebida: {alpha_ratio}
- confiança: {emotion_score}

INSTRUÇÕES DE RESPOSTA:

1. PADRÕES EMOCIONAIS OBSERVADOS
Descreva de forma humanizada os possíveis estados emocionais percebidos na fala e no conteúdo textual.

2. COERÊNCIA ENTRE VOZ E TEXTO
Explique se a maneira de falar parece coerente com o conteúdo verbalizado.

3. ANÁLISE DA VOZ E DA FALA
Descreva ritmo, energia, estabilidade, naturalidade e possíveis oscilações emocionais percebidas, utilizando apenas linguagem natural.

4. RESUMO CLÍNICO DESCRITIVO
Faça um resumo técnico, breve e humanizado, sem listas e sem repetir conceitos.

Finalize obrigatoriamente com:
'Esta análise possui caráter exclusivamente auxiliar e não substitui avaliação clínica profissional.'
"""
    
    response = ollama.chat(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": "Você é um analisador emocional clínico."},
            {"role": "user", "content": fusion_prompt}
        ],
        options={"temperature": 0.3, "num_predict": 512},
    )
    
    analysis = response["message"]["content"]
    
    return {
        'transcription': str(full_text),
        'emotion': str(emotion_label),
        'emotion_confidence': float(emotion_score),
        'audio_features': {
            'loudness': loudness,
            'pitch': pitch,
            'mfcc1': mfcc1,
            'alpha_ratio': alpha_ratio
        },
        'analysis': str(analysis)
    }
