from flask import request, jsonify
from datetime import datetime

from utils.audio_loader import load_audio_from_bytes
from services.audio_service import analyze_audio


def register_audio_routes(app):
    """Register audio-related routes."""
    
    @app.route('/api/audio', methods=['POST'])
    def upload_audio():
        try:
            if 'audio' not in request.files:
                return jsonify({'error': 'No audio file provided'}), 400
            
            audio_file = request.files['audio']
            
            if audio_file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            print('Reading audio bytes...')
            audio_bytes = audio_file.read()
            
            print('Converting audio to numpy...')
            audio_np = load_audio_from_bytes(audio_bytes)
            print(f'Audio converted successfully: {len(audio_np)} samples')
            
            print('Starting audio analysis...')
            analysis_result = analyze_audio(audio_np)
            
            if 'error' in analysis_result:
                return jsonify({
                    'error': analysis_result['error'],
                    'timestamp': datetime.now().isoformat()
                }), 500
            
            return jsonify({
                'message': 'Audio analyzed successfully',
                'timestamp': datetime.now().isoformat(),
                'analysis': analysis_result
            }), 200
            
        except Exception as e:
            print(f'Error processing audio: {e}')
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500
