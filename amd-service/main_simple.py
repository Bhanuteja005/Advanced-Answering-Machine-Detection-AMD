"""
Simplified Hugging Face AMD Service (without PyTorch)
Uses audio signal processing heuristics for AMD detection
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import wave
import io
import time
import logging
import base64
from pydub import AudioSegment

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AMD Hugging Face Service (Simplified)", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AMDResponse(BaseModel):
    result: str  # 'human' or 'machine'
    confidence: float
    duration: float
    processing_time: float
    method: str
    features: dict

class AudioAnalyzer:
    """Analyzes audio features for AMD detection"""
    
    @staticmethod
    def analyze_audio(audio_data: bytes) -> tuple[str, float, dict]:
        """
        Analyze audio to detect human vs machine
        Returns: (prediction, confidence, features)
        """
        try:
            # Try to parse as WAV file
            with wave.open(io.BytesIO(audio_data), 'rb') as wav:
                frames = wav.readframes(wav.getnframes())
                sample_rate = wav.getframerate()
                n_channels = wav.getnchannels()
                sample_width = wav.getsampwidth()
                
                # Convert to numpy array
                if sample_width == 1:
                    dtype = np.uint8
                    audio_array = np.frombuffer(frames, dtype=dtype).astype(np.float32) / 128.0 - 1.0
                elif sample_width == 2:
                    dtype = np.int16
                    audio_array = np.frombuffer(frames, dtype=dtype).astype(np.float32) / 32768.0
                elif sample_width == 4:
                    dtype = np.int32
                    audio_array = np.frombuffer(frames, dtype=dtype).astype(np.float32) / 2147483648.0
                else:
                    raise ValueError(f"Unsupported sample width: {sample_width}")
                
                # If stereo, convert to mono
                if n_channels == 2:
                    audio_array = audio_array.reshape(-1, 2).mean(axis=1)
        
        except Exception as e:
            logger.warning(f"Failed to parse as WAV: {e}, trying MP3 conversion with pydub")
            # Try to convert MP3/other formats using pydub
            try:
                # Load audio with pydub (supports MP3, M4A, OGG, etc.)
                audio = AudioSegment.from_file(io.BytesIO(audio_data))
                
                # Convert to mono if stereo
                if audio.channels > 1:
                    audio = audio.set_channels(1)
                
                # Set sample rate to 8kHz (telephony standard)
                audio = audio.set_frame_rate(8000)
                
                # Convert to 16-bit PCM
                audio = audio.set_sample_width(2)
                
                # Get raw audio data
                raw_data = audio.raw_data
                audio_array = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0
                sample_rate = audio.frame_rate
                
                logger.info(f"Successfully converted audio to WAV using pydub (format detected, {len(audio_array)} samples, {sample_rate}Hz)")
                
            except Exception as pydub_error:
                logger.error(f"pydub conversion failed: {pydub_error}")
                raise Exception(f"Cannot parse audio in any format (tried WAV, pydub conversion): {pydub_error}")
        
        duration = len(audio_array) / sample_rate
        
        # Calculate audio features
        features = AudioAnalyzer._calculate_features(audio_array, sample_rate)
        
        # Decision logic
        prediction, confidence = AudioAnalyzer._make_prediction(features)
        
        logger.info(f"Analysis complete: {prediction} ({confidence:.2f}) - Duration: {duration:.2f}s")
        
        return prediction, confidence, {**features, 'duration': duration, 'sample_rate': sample_rate}
    
    @staticmethod
    def _calculate_features(audio: np.ndarray, sample_rate: int) -> dict:
        """Calculate audio features for AMD detection"""
        
        # 1. Energy analysis
        total_energy = float(np.sum(audio ** 2))
        mean_energy = total_energy / len(audio)
        
        # 2. Zero Crossing Rate (ZCR) - indicates speech variability
        zero_crossings = np.sum(np.abs(np.diff(np.sign(audio)))) / 2
        zcr = float(zero_crossings / len(audio))
        
        # 3. Amplitude statistics
        amplitude_mean = float(np.mean(np.abs(audio)))
        amplitude_std = float(np.std(audio))
        amplitude_max = float(np.max(np.abs(audio)))
        
        # 4. Short-term energy variation (frame-based analysis)
        frame_length = int(0.025 * sample_rate)  # 25ms frames
        hop_length = int(0.010 * sample_rate)     # 10ms hop
        
        frame_energies = []
        silence_frames = 0
        total_frames = 0
        
        silence_threshold = mean_energy * 0.05  # 5% of mean energy
        
        for i in range(0, len(audio) - frame_length, hop_length):
            frame = audio[i:i + frame_length]
            frame_energy = np.sum(frame ** 2)
            frame_energies.append(frame_energy)
            total_frames += 1
            
            if frame_energy < silence_threshold:
                silence_frames += 1
        
        energy_variance = float(np.var(frame_energies)) if frame_energies else 0.0
        energy_std = float(np.std(frame_energies)) if frame_energies else 0.0
        silence_ratio = silence_frames / total_frames if total_frames > 0 else 0.0
        
        # 5. Speech pauses detection (longer silences)
        long_silence_threshold = int(0.5 * sample_rate)  # 500ms
        in_silence = False
        silence_count = 0
        pause_count = 0
        
        for sample in audio:
            if abs(sample) < (amplitude_mean * 0.1):
                silence_count += 1
                if silence_count >= long_silence_threshold and not in_silence:
                    pause_count += 1
                    in_silence = True
            else:
                silence_count = 0
                in_silence = False
        
        return {
            'mean_energy': mean_energy,
            'zero_crossing_rate': zcr,
            'amplitude_mean': amplitude_mean,
            'amplitude_std': amplitude_std,
            'amplitude_max': amplitude_max,
            'energy_variance': energy_variance,
            'energy_std': energy_std,
            'silence_ratio': silence_ratio,
            'pause_count': pause_count,
        }
    
    @staticmethod
    def _make_prediction(features: dict) -> tuple[str, float]:
        """
        Make AMD prediction based on features
        
        Answering machines typically exhibit:
        - Higher silence ratio at start (waiting for beep)
        - More monotone speech (lower energy variance)
        - More consistent amplitude
        - Fewer natural pauses
        - More consistent zero crossing rate
        """
        
        human_score = 0.0
        confidence_factors = []
        
        # Factor 1: Energy variation (humans have more varied energy)
        if features['energy_variance'] > 0.002:
            human_score += 0.25
            confidence_factors.append("high_energy_variation")
        
        # Factor 2: Natural speech patterns (ZCR in natural range)
        if 0.08 < features['zero_crossing_rate'] < 0.15:
            human_score += 0.20
            confidence_factors.append("natural_speech_pattern")
        
        # Factor 3: Amplitude variation (humans have dynamic range)
        if features['amplitude_std'] > 0.1:
            human_score += 0.20
            confidence_factors.append("dynamic_amplitude")
        
        # Factor 4: Natural pauses (humans have more conversational pauses)
        if features['pause_count'] >= 1:
            human_score += 0.15
            confidence_factors.append("natural_pauses")
        
        # Factor 5: Low silence ratio (humans speak more naturally)
        if features['silence_ratio'] < 0.3:
            human_score += 0.20
            confidence_factors.append("low_silence")
        
        # Determine prediction
        is_human = human_score > 0.5
        confidence = human_score if is_human else (1.0 - human_score)
        
        # Adjust confidence to reasonable range (60% - 95%)
        confidence = max(0.60, min(0.95, 0.60 + (confidence * 0.35)))
        
        prediction = 'human' if is_human else 'machine'
        
        logger.info(f"Prediction: {prediction}, Confidence: {confidence:.2f}, "
                   f"Factors: {', '.join(confidence_factors)}, Score: {human_score:.2f}")
        
        return prediction, confidence

@app.get("/")
async def root():
    """Service info endpoint"""
    return {
        "service": "AMD Hugging Face Service (Simplified)",
        "version": "1.0.0",
        "status": "running",
        "method": "signal_processing_heuristics",
        "endpoints": {
            "/": "Service info",
            "/health": "Health check",
            "/detect": "POST audio file for AMD detection"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "amd-huggingface",
        "method": "signal_processing"
    }

@app.post("/detect", response_model=AMDResponse)
async def detect_amd(audio: UploadFile = File(...)):
    """
    Detect if audio contains human or machine speech
    
    Args:
        audio: Audio file (WAV, raw PCM, etc.)
    
    Returns:
        AMDResponse with detection result and confidence
    """
    start_time = time.time()
    
    try:
        logger.info(f"Processing audio file: {audio.filename}, Content-Type: {audio.content_type}")
        
        # Read audio file
        audio_bytes = await audio.read()
        logger.info(f"Audio size: {len(audio_bytes)} bytes")
        
        # Analyze audio
        result, confidence, features = AudioAnalyzer.analyze_audio(audio_bytes)
        
        processing_time = time.time() - start_time
        
        response = AMDResponse(
            result=result,
            confidence=confidence,
            duration=features.get('duration', 0.0),
            processing_time=processing_time,
            method="signal_processing_heuristics",
            features=features
        )
        
        logger.info(f"Detection complete: {result} ({confidence:.2f}) in {processing_time:.3f}s")
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing audio: {str(e)}"
        )

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
    
    start_time = time.time()
    
    try:
        logger.info(f"Downloading audio from URL: {url}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            audio_bytes = response.content
        
        logger.info(f"Downloaded {len(audio_bytes)} bytes")
        
        # Analyze audio
        result, confidence, features = AudioAnalyzer.analyze_audio(audio_bytes)
        
        processing_time = time.time() - start_time
        
        return AMDResponse(
            result=result,
            confidence=confidence,
            duration=features.get('duration', 0.0),
            processing_time=processing_time,
            method="signal_processing_heuristics",
            features=features
        )
        
    except Exception as e:
        logger.error(f"Error downloading/processing audio from URL: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing audio URL: {str(e)}"
        )

class AnalyzeRequest(BaseModel):
    recording_url: str
    twilio_account_sid: str = None
    twilio_auth_token: str = None

@app.post("/analyze")
async def analyze_recording(request: AnalyzeRequest):
    """
    Analyze Twilio recording URL with authentication
    Expected by recordingAnalyzer.ts
    
    Args:
        request: Contains recording_url and optional Twilio credentials
    
    Returns:
        { result, confidence, prediction, score, features }
    """
    import httpx
    import base64
    
    start_time = time.time()
    
    try:
        logger.info(f"Analyzing recording from: {request.recording_url}")
        
        # Prepare headers with authentication if provided
        headers = {}
        if request.twilio_account_sid and request.twilio_auth_token:
            auth_string = f"{request.twilio_account_sid}:{request.twilio_auth_token}"
            auth_bytes = auth_string.encode('utf-8')
            auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
            headers['Authorization'] = f'Basic {auth_b64}'
            logger.info("Using Twilio authentication")
        
        # Download audio
        async with httpx.AsyncClient() as client:
            response = await client.get(request.recording_url, headers=headers, timeout=30.0)
            response.raise_for_status()
            audio_bytes = response.content
        
        logger.info(f"Downloaded {len(audio_bytes)} bytes")
        
        # Analyze audio
        result, confidence, features = AudioAnalyzer.analyze_audio(audio_bytes)
        
        processing_time = time.time() - start_time
        
        # Return in format expected by recordingAnalyzer.ts
        return {
            "result": result,  # 'human' or 'machine'
            "confidence": confidence,  # 0.0 - 1.0
            "prediction": result,  # Alias for compatibility
            "score": confidence,  # Alias for compatibility
            "duration": features.get('duration', 0.0),
            "processing_time": processing_time,
            "method": "signal_processing_heuristics",
            "features": features
        }
        
    except Exception as e:
        logger.error(f"Error analyzing recording: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error analyzing recording: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.getenv("PORT", 8000))
    
    print("\n" + "="*60)
    print("🚀 AMD Hugging Face Service (Simplified)")
    print("="*60)
    print(f"📡 Server: http://localhost:{port}")
    print(f"📖 API Docs: http://localhost:{port}/docs")
    print(f"🔍 Method: Signal Processing Heuristics")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
