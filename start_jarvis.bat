@echo off
echo ==========================================
echo   JARVIS AI SYSTEM INITIALIZATION
echo ==========================================

echo [1/3] Starting JARVIS Core (Backend)...
start cmd /k "cd server && node index.js"

echo [2/3] Starting JARVIS Interface (Frontend)...
start cmd /k "cd client && npm run dev"

echo [3/3] Starting AI Services (Python)...
echo Note: Ensure you have followed the Python setup in README.
start cmd /k "cd ai_services && venv\Scripts\activate && python main.py"

echo ==========================================
echo   ALL SYSTEMS ONLINE, SIR.
echo ==========================================
pause
