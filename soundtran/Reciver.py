import sounddevice as sd
import numpy as np
from scipy.fft import fft

fs = 44100
duration = 0.1  # פרק זמן לביט אחד
threshold = 0.01  # סף לזיהוי עוצמת גל

def record_bit():
    recording = sd.rec(int(duration*fs), samplerate=fs, channels=1)
    sd.wait()
    recording = recording.flatten()
    
    # ניתוח FFT
    Y = np.abs(fft(recording))
    freqs = np.fft.fftfreq(len(Y), 1/fs)
    
    # בודקים אם יש תדר 19kHz חזק
    idx = np.where((freqs > 18500) & (freqs < 19500))
    if np.max(Y[idx]) > threshold:
        return 1
    else:
        return 0

def receive_message(bits_count):
    message = []
    for _ in range(bits_count):
        b = record_bit()
        message.append(b)
    return message

# קבלת הודעה
received = receive_message(10)
print("Received:", received)
