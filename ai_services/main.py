import os
import sys
import time
from flask import Flask, request
from flask_socketio import SocketIO
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/status', methods=['GET'])
def status():
    return {"status": "AI Services Online"}

@socketio.on('connect')
def handle_connect():
    print('Client connected to Python AI Services')

@socketio.on('start_listening')
def handle_listen():
    print('Starting voice listener...')
    # Placeholder for wake word + whisper logic
    socketio.emit('voice_status', {'state': 'listening'})

if __name__ == '__main__':
    print("JARVIS AI Services starting...")
    socketio.run(app, port=5001)
