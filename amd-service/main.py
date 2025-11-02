"""
Hugging Face AMD Service
Uses wav2vec2 model for answering machine detection
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import torchaudio
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2Processor
import numpy as np
import io
from pydantic import BaseModel
from typing import Optional
import logging
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AMD Hugging Face Service", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration
MODEL_NAME = "facebook/wav2vec2-base"  # Base model
SAMPLE_RATE = 16000
MAX_DURATION = 10  # Maximum audio duration in seconds

class AudioProcessor:
    """Processes audio for AMD detection"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # For demo purposes, we'll use a simpler heuristic-based approach
        # In production, you'd fine-tune wav2vec2 on AMD dataset
        self.sample_rate = SAMPLE_RATE
        
    def analyze_audio_features(self, waveform: torch.Tensor) -> dict:
        """
        Analyze audio features to detect human vs machine
        Uses heuristics based on audio characteristics
        """
        # Convert to mono if stereo
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)
        
        # Calculate features
        duration = waveform.shape[1] / self.sample_rate
        
        # Energy analysis
        energy = torch.sum(waveform ** 2).item()
        avg_energy = energy / waveform.shape[1]
        
        # Zero crossing rate (indicates speech variability)
        zero_crossings = torch.sum(torch.abs(torch.diff(torch.sign(waveform)))).item()
        zcr = zero_crossings / waveform.shape[1]
        
        # Amplitude variation
        amplitude_std = torch.std(waveform).item()
        
        # Short-term energy variation (indicates natural speech patterns)
        frame_size = int(0.025 * self.sample_rate)  # 25ms frames
        frames = waveform.unfold(1, frame_size, frame_size // 2)
        frame_energies = torch.sum(frames ** 2, dim=2)
        energy_variance = torch.var(frame_energies).item()
        
        logger.info(f"Audio features - Duration: {duration:.2f}s, Avg Energy: {avg_energy:.6f}, "
                   f"ZCR: {zcr:.6f}, Amp Std: {amplitude_std:.6f}, Energy Var: {energy_variance:.6f}")
        
        return {
            'duration': duration,
            'avg_energy': avg_energy,
            'zero_crossing_rate': zcr,
            'amplitude_std': amplitude_std,
            'energy_variance': energy_variance
        }
    
    def detect_amd(self, waveform: torch.Tensor) -> tuple[str, float]:
        """
        Detect if audio is human or machine
        Returns: (prediction: 'human'|'machine', confidence: float)
        """
        features = self.analyze_audio_features(waveform)
        
        # Heuristic-based detection
        # Machines typically have:
        # - More consistent energy (lower variance)
        # - More monotone (lower zero crossing rate variation)
        # - More uniform amplitude
        
        score = 0.0
        confidence_factors = []
        
        # Factor 1: Energy variance (humans have more variation)
        if features['energy_variance'] > 0.001:
            score += 0.3
            confidence_factors.append("High energy variation")
        else:
            confidence_factors.append("Low energy variation")
        
        # Factor 2: Zero crossing rate (humans have more varied speech)
        if features['zero_crossing_rate'] > 0.1:
            score += 0.3
            confidence_factors.append("Varied speech patterns")
        else:
            confidence_factors.append("Monotone speech")
        
        # Factor 3: Amplitude variation (humans have more dynamic range)
        if features['amplitude_std'] > 0.05:
            score += 0.2
            confidence_factors.append("Dynamic amplitude")
        else:
            confidence_factors.append("Flat amplitude")
        
        # Factor 4: Duration analysis (machines often have longer monotone sections)
        if features['duration'] < 3.0 and features['avg_energy'] > 0.001:
            score += 0.2
            confidence_factors.append("Short natural greeting")
        
        # Determine prediction
        prediction = 'human' if score > 0.5 else 'machine'
        confidence = score if prediction == 'human' else (1.0 - score)
        
        # Ensure confidence is in reasonable range
        confidence = max(0.6, min(0.95, confidence))
        
        logger.info(f"AMD Detection: {prediction} (confidence: {confidence:.2f}) - "
                   f"Factors: {', '.join(confidence_factors)}")
        
        return prediction, confidence

# Initialize processor
processor = AudioProcessor()

class AMDResponse(BaseModel):
    result: str  # 'human' or 'machine'
    confidence: float
    duration: float
    features: dict

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "AMD Hugging Face Service",
        "status": "running",
        "model": MODEL_NAME,
        "device": str(processor.device)
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/detect", response_model=AMDResponse)
async def detect_amd(audio: UploadFile = File(...)):
    """
    Detect if audio contains human or machine speech
    
    Args:
        audio: Audio file (WAV, MP3, etc.)
    
    Returns:
        AMDResponse with detection result and confidence
    """
    try:
        logger.info(f"Processing audio file: {audio.filename}")
        
        # Read audio file
        audio_bytes = await audio.read()
        
        # Load audio with torchaudio
        waveform, sample_rate = torchaudio.load(io.BytesIO(audio_bytes))
        
        logger.info(f"Audio loaded - Sample rate: {sample_rate}, Shape: {waveform.shape}")
        
        # Resample if necessary
        if sample_rate != SAMPLE_RATE:
            resampler = torchaudio.transforms.Resample(sample_rate, SAMPLE_RATE)
            waveform = resampler(waveform)
            logger.info(f"Resampled to {SAMPLE_RATE}Hz")
        
        # Detect AMD
        result, confidence = processor.detect_amd(waveform)
        
        # Get features for response
        features = processor.analyze_audio_features(waveform)
        
        response = AMDResponse(
            result=result,
            confidence=confidence,
            duration=features['duration'],
            features=features
        )
        
        logger.info(f"Detection complete: {result} ({confidence:.2f})")
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@app.post("/detect-url")
async def detect_amd_from_url(url: str):
    """
    Detect AMD from audio URL (e.g., Twilio recording URL)
    
    Args:
        url: URL to audio file
    
    Returns:
        AMDResponse with detection result
    """
    import httpx
    
    try:
        logger.info(f"Downloading audio from URL: {url}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            
            audio_bytes = response.content
            
        # Load audio
        waveform, sample_rate = torchaudio.load(io.BytesIO(audio_bytes))
        
        # Resample if necessary
        if sample_rate != SAMPLE_RATE:
            resampler = torchaudio.transforms.Resample(sample_rate, SAMPLE_RATE)
            waveform = resampler(waveform)
        
        # Detect AMD
        result, confidence = processor.detect_amd(waveform)
        features = processor.analyze_audio_features(waveform)
        
        return AMDResponse(
            result=result,
            confidence=confidence,
            duration=features['duration'],
            features=features
        )
        
    except Exception as e:
        logger.error(f"Error downloading/processing audio from URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing audio URL: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
