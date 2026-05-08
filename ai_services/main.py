import os
import sys
import time
import threading
import socketio
import eventlet
from flask import Flask
from flask_socketio import SocketIO
import speech_recognition as sr
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Node.js Backend Client
sio_client = socketio.Client()

def connect_to_backend():
    try:
        sio_client.connect('http://127.0.0.1:3001')
        print("Connected to Node.js Backend")
    except:
        print("Waiting for Node.js Backend...")
        time.sleep(5)
        connect_to_backend()

def listen_loop():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    
    print("JARVIS Listening Service Active...")
    
    with mic as source:
        recognizer.adjust_for_ambient_noise(source)
        
        while True:
            try:
                print("Listening...")
                audio = recognizer.listen(source, phrase_time_limit=5)
                print("Processing speech...")
                
                # Using Google for now as a fallback if Whisper is not setup, 
                # but it can be swapped for Whisper locally.
                text = recognizer.recognize_google(audio)
                print(f"You said: {text}")
                
                if sio_client.connected:
                    sio_client.emit('command', {'text': text})
                
                socketio.emit('voice_text', {'text': text})
                
            except sr.UnknownValueError:
                pass
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
