# AMD Hugging Face Service

Python-based AMD detection service using audio analysis.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the service:
```bash
python main.py
```

The service will start on `http://localhost:8000`

## API Endpoints

### POST /detect
Upload audio file for AMD detection

### POST /detect-url
Detect AMD from audio URL

### GET /health
Health check endpoint

## Testing

```bash
# Test with curl
curl -X POST "http://localhost:8000/detect" -F "audio=@test.wav"
```
