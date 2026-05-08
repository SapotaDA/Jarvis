import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('minimize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  onVoiceData: (callback: any) => ipcRenderer.on('voice-data', callback),
  sendVoiceCommand: (command: string) => ipcRenderer.send('voice-command', command),
});
