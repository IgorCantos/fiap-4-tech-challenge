import json
import os
import subprocess
import threading
import urllib.request
from faster_whisper import WhisperModel
from transformers import pipeline
from silero_vad import load_silero_vad
import opensmile
import ollama


# Global model instances
whisper_model = None
emotion_classifier = None
text_sentiment = None
smile = None
vad_model = None
models_loaded = False
models_lock = threading.Lock()

# Configuration
LLM_MODEL = "gemma3:1b"
MODEL_CACHE_DIR = None


def set_model_cache_dir(cache_dir):
    """Set the model cache directory."""
    global MODEL_CACHE_DIR
    MODEL_CACHE_DIR = cache_dir


def to_python_float(value):
    """Convert value to Python float safely."""
    if value is None:
        return None
    try:
        return float(value)
    except:
        return None


def ensure_ollama_model(model_name):
    """Ensure Ollama model is installed."""
    try:
        print(f"Checking Ollama model: {model_name}")
        
        models_response = ollama.list()
        installed_models = []
        
        # Compatibility with different Ollama versions
        if "models" in models_response:
            for model in models_response["models"]:
                if "model" in model:
                    installed_models.append(model["model"])
                elif "name" in model:
                    installed_models.append(model["name"])
        
        if model_name in installed_models:
            print(f"Ollama model already installed: {model_name}")
            return
        
        print(f"Downloading Ollama model: {model_name}")
        host = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
        try:
            subprocess.run(["ollama", "pull", model_name], check=True)
        except (FileNotFoundError, OSError):
            req = urllib.request.Request(
                f"{host}/api/pull",
                data=json.dumps({"name": model_name}).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=600) as resp:
                while resp.readline():
                    pass
        print(f"Model downloaded successfully: {model_name}")
    
    except Exception as e:
        print(f"Failed to download Ollama model: {e}")
        raise


def load_models():
    """Load all ML models."""
    global whisper_model, emotion_classifier, text_sentiment, smile, vad_model, models_loaded
    
    with models_lock:
        if models_loaded:
            print("Models already loaded.")
            return
        
        print("Loading models...")
        
        # VAD
        print("Loading VAD model...")
        vad_model = load_silero_vad()
        
        # Whisper
        print("Loading Whisper model...")
        whisper_model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8",
            download_root=MODEL_CACHE_DIR
        )
        
        # Emotion Classifier
        print("Loading emotion classifier...")
        emotion_classifier = pipeline(
            "audio-classification",
            model="audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim",
            cache_dir=MODEL_CACHE_DIR
        )
        
        # Text Sentiment
        print("Loading text sentiment...")
        text_sentiment = pipeline(
            "text-classification",
            model="tabularisai/multilingual-sentiment-analysis",
            cache_dir=MODEL_CACHE_DIR
        )
        
        # OpenSMILE
        print("Loading openSMILE...")
        smile = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.Functionals,
        )
        
        # Ollama
        ensure_ollama_model(LLM_MODEL)
        print("Preloading Ollama model...")
        
        models_loaded = True
        print("All models loaded successfully.")


def get_whisper_model():
    """Get Whisper model instance."""
    global whisper_model
    if whisper_model is None:
        load_models()
    return whisper_model


def get_emotion_classifier():
    """Get emotion classifier instance."""
    global emotion_classifier
    if emotion_classifier is None:
        load_models()
    return emotion_classifier


def get_text_sentiment():
    """Get text sentiment model instance."""
    global text_sentiment
    if text_sentiment is None:
        load_models()
    return text_sentiment


def get_smile():
    """Get openSMILE instance."""
    global smile
    if smile is None:
        load_models()
    return smile


def get_vad_model():
    """Get VAD model instance."""
    global vad_model
    if vad_model is None:
        load_models()
    return vad_model
