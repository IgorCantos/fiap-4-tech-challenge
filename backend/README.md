# Python Backend - Audio Recording API

Flask backend for handling audio file uploads from the Next.js frontend.

## Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server**:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoint

### POST /api/audio

Uploads an audio file and saves it to the `recordings` directory.

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: `audio` field with the audio file

**Response**:
- Status: 200 on success
- Body: JSON with message, filename, size, and timestamp

**Example Response**:
```json
{
  "message": "Audio received successfully",
  "filename": "recording-2026-05-17-02-16-40-210000.webm",
  "size": 39902,
  "timestamp": "2026-05-17T02:16:40.210000"
}
```

## Directory Structure

```
backend/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── recordings/         # Directory for saved audio files (created automatically)
└── README.md          # This file
```

## Dependencies

- Flask 3.0.0
- Flask-CORS 4.0.0

## Notes

- The backend uses CORS to allow requests from the Next.js frontend
- Audio files are saved in WebM format
- Each recording is saved with a unique timestamp-based filename
- The recordings directory is created automatically if it doesn't exist
