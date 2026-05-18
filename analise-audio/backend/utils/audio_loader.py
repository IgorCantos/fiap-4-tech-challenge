import io
import numpy as np
import av


def load_audio_from_bytes(audio_bytes, sample_rate=16000):
    """Load audio from bytes and convert to numpy array."""
    container = av.open(io.BytesIO(audio_bytes))
    audio_stream = container.streams.audio[0]
    
    resampler = av.audio.resampler.AudioResampler(
        format="flt",
        layout="mono",
        rate=sample_rate
    )
    
    audio_chunks = []
    
    for frame in container.decode(audio_stream):
        frame = resampler.resample(frame)
        
        if isinstance(frame, list):
            frame = frame[0]
        
        audio = frame.to_ndarray()
        audio_chunks.append(audio)
    
    if len(audio_chunks) == 0:
        raise Exception("No audio data found")
    
    audio_np = np.concatenate(audio_chunks, axis=1)
    audio_np = audio_np.flatten().astype(np.float32)
    
    return audio_np


def normalize_audio(audio_np):
    """Normalize audio array."""
    max_val = np.max(np.abs(audio_np))
    if max_val > 0:
        audio_np = audio_np / max_val
    return audio_np
