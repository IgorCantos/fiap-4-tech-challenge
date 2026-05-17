from flask import Flask
from flask_cors import CORS
import os

from utils.model_loader import set_model_cache_dir, load_models
from routes.audio_route import register_audio_routes
from routes.analyses_route import register_analyses_routes

# ============================================================
# APP
# ============================================================

app = Flask(__name__)
CORS(app)

# ============================================================
# DIRECTORIES
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_CACHE_DIR = os.path.join(BASE_DIR, 'model_cache')

os.makedirs(MODEL_CACHE_DIR, exist_ok=True)

# ============================================================
# CACHE CONFIG
# ============================================================

os.environ["HF_HOME"] = MODEL_CACHE_DIR
os.environ["TRANSFORMERS_CACHE"] = MODEL_CACHE_DIR
os.environ["TORCH_HOME"] = MODEL_CACHE_DIR

# ============================================================
# SETUP
# ============================================================

set_model_cache_dir(MODEL_CACHE_DIR)

# Register routes
register_audio_routes(app)
register_analyses_routes(app)

# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("Loading models...")
    load_models()
    print("Starting server...")
    app.run(host='0.0.0.0', port=5000, debug=False)
