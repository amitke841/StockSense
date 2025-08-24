import numpy as np
import sounddevice as sd  #להתקין גרסה 0.5.2
import time

fs = 44100  # קצב דגימה
duration = 0.1  # זמן ביט אחד

def send_bit(bit):
    t = np.linspace(0, duration, int(fs*duration), endpoint=False)
    if bit == 1:
        tone = 0.2*np.sin(2*np.pi*19000*t)  # 19kHz
    else:
        tone = np.zeros_like(t)
    sd.play(tone, fs)
    sd.wait()

def send_message(message):
    for b in message:
        send_bit(b)

# הודעת דוגמה
message = [1,0,1,1,0,0,1,1,0,1]
send_message(message)
