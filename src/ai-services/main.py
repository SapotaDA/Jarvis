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
import subprocess
import platform
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

def speak_text(text):
    """Text-to-speech function for JARVIS responses"""
    try:
        if platform.system() == 'Windows':
            # Use Windows SAPI for TTS
            subprocess.run([
                'powershell', '-Command',
                f'Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.Speak("{text}")'
            ], capture_output=True)
        else:
            # For other platforms, try using espeak or similar
            try:
                subprocess.run(['espeak', text], capture_output=True)
            except:
                print(f"🎤 JARVIS: {text}")
        
        print(f"🎤 JARVIS speaking: {text}")
        
    except Exception as e:
        print(f"TTS Error: {e}")
        print(f"🎤 JARVIS: {text}")

def listen_loop():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    
    print("JARVIS Listening Service Active...")
    print("🎤 Voice Recognition: ENABLED")
    print("🎤 Text-to-Speech: ENABLED")
    
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=2)
        recognizer.dynamic_energy_threshold = True
        recognizer.pause_threshold = 0.8
        
        while True:
            try:
                print("🎤 Listening for command...")
                audio = recognizer.listen(source, phrase_time_limit=5, timeout=1)
                print("🎤 Processing speech...")
                
                # Try to recognize speech with multiple engines
                text = None
                engine_used = "unknown"
                
                try:
                    # First try Whisper (if available)
                    text = recognizer.recognize_whisper(audio, model="tiny.en")
                    engine_used = "whisper"
                except:
                    try:
                        # Fallback to Google Speech Recognition
                        text = recognizer.recognize_google(audio)
                        engine_used = "google"
                    except:
                        try:
                            # If all fails, try Sphinx (offline)
                            text = recognizer.recognize_sphinx(audio)
                            engine_used = "sphinx"
                        except:
                            pass
                
                if text:
                    print(f"🎤 You said [{engine_used}]: {text}")
                    
                    # Filter out very short or meaningless inputs
                    if len(text.strip()) > 2 and not text.strip().lower() in ['hey', 'hello', 'hi', 'um', 'uh']:
                        if sio_client.connected:
                            print("🎤 Sending to backend...")
                            sio_client.emit('command', {'text': text})
                        else:
                            print("🎤 Not connected to backend")
                        
                        socketio.emit('voice_text', {'text': text})
                    else:
                        print("🎤 Input too short or filtered out")
                else:
                    print("🎤 Could not recognize speech")
                
            except sr.WaitTimeoutError:
                continue
            except sr.UnknownValueError:
                print("🎤 Could not understand audio")
            except sr.RequestError as e:
                print(f"🎤 Speech recognition error: {e}")
                time.sleep(2)
            except Exception as e:
                print(f"🎤 Error: {e}")
                time.sleep(1)

@socketio.on('ai_response')
def handle_ai_response(data):
    """Handle AI responses and speak them using TTS"""
    try:
        text = data.get('text', '')
        if text:
            print(f"🎤 AI Response received: {text}")
            # Speak the AI response
            speak_text(text)
    except Exception as e:
        print(f"Error handling AI response: {e}")

@socketio.on('voice_settings')
def handle_voice_settings(data):
    """Handle voice settings updates"""
    try:
        print(f"🎤 Voice settings updated: {data}")
        # Could integrate with voice engine settings here
    except Exception as e:
        print(f"Error updating voice settings: {e}")

@app.route('/status')
def status():
    return {"status": "AI Services Online", "voice_enabled": True}

if __name__ == '__main__':
    # Start listening thread
    threading.Thread(target=listen_loop, daemon=True).start()
    
    # Start backend connection thread
    threading.Thread(target=connect_to_backend, daemon=True).start()
    
    print("JARVIS AI Services starting on port 5001...")
    print("🎤 Voice Recognition: ENABLED")
    print("🎤 Text-to-Speech: ENABLED")
    socketio.run(app, port=5001)
