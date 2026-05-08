import os
import sys
import time
import threading
import socketio
import eventlet
from flask import Flask
from flask_socketio import SocketIO
from socketio import Client as SocketIOClient
import speech_recognition as sr
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Node.js Backend Client
sio_client = SocketIOClient(logger=True, engineio_logger=True)

def connect_to_backend():
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            if not sio_client.connected:
                sio_client.connect('http://127.0.0.1:3001')
                print("Connected to Node.js Backend")
                return True
        except Exception as e:
            print(f"Connection attempt {retry_count + 1} failed: {e}")
            retry_count += 1
            time.sleep(2)
    
    print("Could not connect to backend after multiple attempts")
    return False

def listen_loop():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    
    print("JARVIS Listening Service Active...")
    
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)
        
        while True:
            try:
                print("Listening for command...")
                audio = recognizer.listen(source, phrase_time_limit=3, timeout=1)
                print("Processing speech...")
                
                # Try to recognize speech
                try:
                    # First try Whisper (if available)
                    text = recognizer.recognize_whisper(audio, model="tiny.en")
                except:
                    try:
                        # Fallback to Google Speech Recognition
                        text = recognizer.recognize_google(audio)
                    except:
                        # If all fails, try Sphinx (offline)
                        text = recognizer.recognize_sphinx(audio)
                
                print(f"You said: {text}")
                
                # Only send if we have meaningful text
                if len(text.strip()) > 0 and not text.strip().lower() in ['hey', 'hello', 'hi']:
                    if sio_client.connected:
                        print("Sending to backend...")
                        sio_client.emit('command', {'text': text})
                    else:
                        print("Not connected to backend")
                    
                    socketio.emit('voice_text', {'text': text})
                
            except sr.WaitTimeoutError:
                continue
            except sr.UnknownValueError:
                print("Could not understand audio")
            except sr.RequestError as e:
                print(f"Speech recognition error: {e}")
                time.sleep(2)
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(1)

@app.route('/status')
def status():
    return {"status": "AI Services Online"}

if __name__ == '__main__':
    # Start listening thread
    threading.Thread(target=listen_loop, daemon=True).start()
    
    # Start backend connection thread
    threading.Thread(target=connect_to_backend, daemon=True).start()
    
    print("JARVIS AI Services starting on port 5001...")
    socketio.run(app, port=5001)
