# JARVIS — Personal Offline AI Assistant

JARVIS is a highly advanced, local-first AI assistant inspired by the MCU. It runs entirely on your local machine, ensuring total privacy and near-instant responsiveness.

## 🚀 One-Click Startup (Windows)
Simply run the `start_jarvis.bat` file in the root directory. This will launch all three JARVIS subsystems:
1. **JARVIS Core**: The Node.js backend & memory database.
2. **JARVIS Interface**: The cinematic Electron desktop application.
3. **AI Services**: The Python voice recognition and automation engine.

## 📁 Project Architecture

```text
JARVIS/
├── client/          # Electron + React + Tailwind (The "Face")
├── server/          # Node.js + Express + SQLite + Ollama (The "Nervous System")
├── ai_services/     # Python + Whisper + OpenCV (The "Brain")
├── start_jarvis.bat # One-click launcher
└── package.json     # Project-wide task runner
```

## 🛠️ Initial Configuration

### 1. The Brain (Ollama)
JARVIS requires [Ollama](https://ollama.com/) to be installed.
- Ensure Ollama is running.
- Pull the default model: `ollama pull qwen3.5:latest` (or `llama3`).

### 2. Python Environment (Voice)
To enable voice recognition ("when you say something"):
```powershell
cd ai_services
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Desktop Client
```powershell
cd client
npm install
```

## 🎙️ Using JARVIS
- **Activation**: Click the **"Start JARVIS AI"** button.
- **Voice**: Speak naturally. JARVIS is always listening when the AI Services are active.
- **Captions**: Your speech and JARVIS's thoughts will appear as cinematic subtitles.
- **Dashboard**: Click the **Pulsing Orb** to view memory logs and system stats.

## 🔒 Privacy & Security
Everything stays on your machine. No data is sent to the cloud. All memories are stored in a local SQLite database (`server/jarvis_memory.db`).
