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

EMOTION_MAP = {
    "neu": "neutro",
    "hap": "feliz",
    "ang": "irritado",
    "sad": "triste"
}


def categorizar_intensidade(valor):
    """Categoriza a intensidade vocal."""
    if not valor: return "normal"
    if valor > 0.4: return "alta"
    if valor < 0.15: return "baixa"
    return "normal"


def categorizar_tom(valor):
    """Categoriza a variação de tom da fala."""
    if not valor: return "estável"
    if valor > 20: return "com variações marcantes"
    if valor < 12: return "monótona"
    return "estável"


def categorizar_estabilidade(valor):
    """Categoriza a estabilidade vocal."""
    if not valor: return "tranquila/segura"
    if valor > -10: return "tensa/agitada"
    return "tranquila/segura"


def extrair_feature(features_df, nome_coluna):
    """Extrai uma feature de áudio do DataFrame de forma segura."""
    if nome_coluna in features_df.columns:
        return to_python_float(features_df[nome_coluna].values[0])
    return None


def analyze_audio(audio_np):
    """Analyze audio and return transcription, emotion, and LLM analysis."""
    
    # 1. Normalização
    audio_np = normalize_audio(audio_np)
    
    # 2. Carregamento de Modelos
    whisper_model = get_whisper_model()
    emotion_classifier = get_emotion_classifier()
    smile = get_smile()
    vad_model = get_vad_model()
    
    # 3. Detecção de Voz (VAD)
    print("Running VAD...")
    speech_timestamps = get_speech_timestamps(
        audio_np,
        vad_model,
        sampling_rate=SAMPLE_RATE
    )
    
    if not speech_timestamps:
        return {
            'error': 'No speech detected in audio',
            'transcription': '',
            'emotion': 'inconclusiva',
            'analysis': 'Não foi detectada fala no áudio.'
        }
    
    # 4. Transcrição (Whisper)
    print("Transcribing audio...")
    segments, _ = whisper_model.transcribe(audio_np, language="pt")
    full_text = " ".join(segment.text for segment in segments).strip()
    
    # 5. Detecção de Emoção
    print("Detecting emotion...")
    result = emotion_classifier(audio_np, sampling_rate=SAMPLE_RATE)
    top_emotion = max(result, key=lambda x: x["score"])
    
    emotion_label_raw = str(top_emotion["label"]).lower()
    emotion_score = float(top_emotion["score"])
    
    emotion_label = EMOTION_MAP.get(emotion_label_raw, emotion_label_raw)
    if emotion_score < 0.4:
        emotion_label = "inconclusiva"
    
    # 6. Extração de Features Acústicas (OpenSMILE)
    print("Extracting audio features...")
    features = smile.process_signal(audio_np, SAMPLE_RATE)
    
    loudness = extrair_feature(features, "loudness_sma3_amean")
    pitch = extrair_feature(features, "F0semitoneFrom27.5Hz_sma3nz_amean")
    mfcc1 = extrair_feature(features, "mfcc1_sma3_amean")
    alpha_ratio = extrair_feature(features, "alphaRatioV_sma3nz_amean")
    
    # 7. Geração de Análise Humanizada (LLM)
    print("Generating LLM analysis...")
    q_intensity = categorizar_intensidade(loudness)
    q_pitch = categorizar_tom(pitch)
    q_stability = categorizar_estabilidade(alpha_ratio)
    
    fusion_prompt = f"""
Você é um assistente especializado em análise comportamental e emocional para apoio clínico.

Sua função é redigir um relatório descritivo, humanizado e de fácil leitura para médicos e profissionais de saúde mental.

DADOS DA ANÁLISE:
- Transcrição do relato do paciente: "{full_text}"
- Emoção predominante detectada na voz: {emotion_label.capitalize()}
- Intensidade da voz: {q_intensity}
- Variação de tom: {q_pitch}
- Estabilidade vocal: {q_stability}

INSTRUÇÕES IMPORTANTES:
- Escreva de forma humanizada, empática e profissional.
- O texto DEVE ser fluído, coeso e ter tom clínico.
- É ESTRITAMENTE PROIBIDO incluir números, valores decimais, métricas ou jargões técnicos de software.
- Concentre-se em como a emoção detectada e as características vocais se relacionam com o conteúdo da fala.
- NÃO faça diagnósticos médicos. Apenas descreva o que foi observado.

ESTRUTURA DO RELATÓRIO:

1. PADRÕES EMOCIONAIS OBSERVADOS
(Descreva o estado emocional do paciente com base no conteúdo da fala e na emoção detectada. Use linguagem clínica e descritiva)

2. COERÊNCIA ENTRE VOZ E TEXTO
(Explique de forma clínica se a maneira de falar e a emoção percebida na voz parecem coerentes com o conteúdo relatado)

3. ANÁLISE DA VOZ E DA FALA
(Descreva o ritmo, a energia e a naturalidade da fala baseando-se nos indicadores de intensidade, tom e estabilidade fornecidos, sem citar que vieram de um sistema)

4. RESUMO CLÍNICO DESCRITIVO
(Faça uma breve síntese do estado emocional e do discurso do paciente, útil para o acompanhamento do profissional de saúde)

Finalize obrigatoriamente o relatório com a frase:
"Esta análise possui caráter exclusivamente auxiliar e não substitui avaliação clínica profissional."
"""
    
    response = ollama.chat(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": "Você é um analisador emocional clínico."},
            {"role": "user", "content": fusion_prompt}
        ],
        options={"temperature": 0.3, "num_predict": 512},
    )
    
    return {
        'transcription': str(full_text),
        'emotion': str(emotion_label),
        'emotion_confidence': emotion_score,
        'audio_features': {
            'loudness': loudness,
            'pitch': pitch,
            'mfcc1': mfcc1,
            'alpha_ratio': alpha_ratio
        },
        'analysis': str(response["message"]["content"])
    }
