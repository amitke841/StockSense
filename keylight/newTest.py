import ctypes
import time

# קודים מיוחדים לנורות
VK_CAPITAL = 0x14  # CapsLock
KEYEVENTF_EXTENDEDKEY = 0x0001
KEYEVENTF_KEYUP = 0x0002

def toggle_capslock():
    # שולח לחיצה על CapsLock כדי להדליק/לכבות את ה-LED
    ctypes.windll.user32.keybd_event(VK_CAPITAL, 0, KEYEVENTF_EXTENDEDKEY, 0)
    ctypes.windll.user32.keybd_event(VK_CAPITAL, 0, KEYEVENTF_KEYUP, 0)

def send_bit(bit, duration=0.5):
    if bit == 1:
        toggle_capslock()  # מדליק/מכבה
        time.sleep(duration)
        toggle_capslock()  # מחזיר חזרה
    else:
        time.sleep(duration)

# שליחת הודעה
message = [1,0,1,1,0,0,1,1,1,1,1]  # סתם דוגמה
for b in message:
    print(f"Sending bit: {b}")
    send_bit(b)
