# JARVIS — Personal Offline AI Assistant

JARVIS is a local-first, privacy-focused AI assistant built with Electron, Node.js, Python, and Ollama.

## Project Structure

- `client/`: Electron + React (Vite) - The UI and desktop shell.
- `server/`: Node.js Backend - Memory management, LLM coordination, and APIs.
- `ai_services/`: Python Services - Voice (Wake Word, STT, TTS) and Vision (OCR, Screen Analysis).

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python 3.10+
- [Ollama](https://ollama.com/) (Must be installed and running)
  - Run `ollama pull llama3` to download the model.

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```

### 3. Server Setup
```bash
cd server
npm install
node index.js
```

### 4. AI Services Setup
```bash
cd ai_services
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Features Implemented
- [x] Futuristic Electron Shell (Transparent, Frameless)
- [x] JARVIS AI Orb (Animated)
- [x] Dashboard UI (Glassmorphism)
- [x] SQLite Memory Database
- [x] Ollama (Llama 3) Integration
- [x] AI Services Foundation (Python)

## Next Steps
- Implement Porcupine wake word detection.
- Integrate Whisper for real-time STT.
- Implement screen capture and OCR analysis.
- Connect the frontend input to the Ollama backend.
