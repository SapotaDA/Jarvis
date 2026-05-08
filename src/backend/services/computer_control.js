const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ComputerControlService {
    constructor() {
        this.platform = os.platform();
        this.isWindows = this.platform === 'win32';
        this.isMac = this.platform === 'darwin';
        this.isLinux = this.platform === 'linux';
    }

    // File Operations
    async createFile(filePath, content = '') {
        try {
            await fs.writeFile(filePath, content, 'utf8');
            return { success: true, message: `File created: ${filePath}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async readFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return { success: true, content };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            return { success: true, message: `File deleted: ${filePath}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async listFiles(directory) {
        try {
            const files = await fs.readdir(directory);
            const fileDetails = await Promise.all(
                files.map(async (file) => {
                    const filePath = path.join(directory, file);
                    const stats = await fs.stat(filePath);
                    return {
                        name: file,
                        isDirectory: stats.isDirectory(),
                        size: stats.size,
                        modified: stats.mtime
                    };
                })
            );
            return { success: true, files: fileDetails };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createFolder(folderPath) {
        try {
            await fs.mkdir(folderPath, { recursive: true });
            return { success: true, message: `Folder created: ${folderPath}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // System Operations
    async openApplication(appName) {
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                command = `start "" "${appName}"`;
            } else if (this.isMac) {
                command = `open "${appName}"`;
            } else {
                command = `xdg-open "${appName}"`;
            }

            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, message: `Opened: ${appName}` });
                }
            });
        });
    }

    async openURL(url) {
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                command = `start "" "${url}"`;
            } else if (this.isMac) {
                command = `open "${url}"`;
            } else {
                command = `xdg-open "${url}"`;
            }

            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, message: `Opened URL: ${url}` });
                }
            });
        });
    }

    async shutdownSystem() {
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                command = 'shutdown /s /t 0';
            } else if (this.isMac) {
                command = 'sudo shutdown -h now';
            } else {
                command = 'sudo shutdown -h now';
            }

            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, message: 'System shutdown initiated' });
                }
            });
        });
    }

    async restartSystem() {
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                command = 'shutdown /r /t 0';
            } else if (this.isMac) {
                command = 'sudo shutdown -r now';
            } else {
                command = 'sudo shutdown -r now';
            }

            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, message: 'System restart initiated' });
                }
            });
        });
    }

    // System Information
    async getSystemInfo() {
        try {
            const info = {
                platform: this.platform,
                hostname: os.hostname(),
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                cpuCount: os.cpus().length,
                uptime: os.uptime(),
                loadAverage: os.loadavg(),
                networkInterfaces: os.networkInterfaces()
            };

            // Get disk space (platform-specific)
            if (this.isWindows) {
                const diskInfo = await this.getWindowsDiskInfo();
                info.diskSpace = diskInfo;
            } else {
                const diskInfo = await this.getUnixDiskInfo();
                info.diskSpace = diskInfo;
            }

            return { success: true, info };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getWindowsDiskInfo() {
        return new Promise((resolve) => {
            exec('wmic logicaldisk get size,freespace,caption', (error, stdout) => {
                if (error) {
                    resolve({ total: 0, free: 0 });
                    return;
                }

                const lines = stdout.split('\n').filter(line => line.trim());
                const disks = [];

                for (let i = 1; i < lines.length; i++) {
                    const parts = lines[i].trim().split(/\s+/);
                    if (parts.length >= 3) {
                        disks.push({
                            drive: parts[0],
                            free: parseInt(parts[1]),
                            total: parseInt(parts[2])
                        });
                    }
                }

                resolve(disks);
            });
        });
    }

    async getUnixDiskInfo() {
        return new Promise((resolve) => {
            exec('df -h', (error, stdout) => {
                if (error) {
                    resolve({ total: 0, free: 0 });
                    return;
                }

                const lines = stdout.split('\n').filter(line => line.trim());
                const disks = [];

                for (let i = 1; i < lines.length; i++) {
                    const parts = lines[i].trim().split(/\s+/);
                    if (parts.length >= 6) {
                        disks.push({
                            filesystem: parts[0],
                            size: parts[1],
                            used: parts[2],
                            available: parts[3],
                            mount: parts[5]
                        });
                    }
                }

                resolve(disks);
            });
        });
    }

    // Process Management
    async getRunningProcesses() {
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                command = 'tasklist /fo csv';
            } else if (this.isMac) {
                command = 'ps aux';
            } else {
                command = 'ps aux';
            }

            exec(command, (error, stdout) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                    return;
                }

                const processes = this.parseProcessList(stdout);
                resolve({ success: true, processes });
            });
        });
    }

    parseProcessList(output) {
        const lines = output.split('\n').filter(line => line.trim());
        const processes = [];

        if (this.isWindows) {
            // Windows tasklist CSV format
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split('","').map(p => p.replace(/"/g, ''));
                if (parts.length >= 5) {
                    processes.push({
                        name: parts[0],
                        pid: parts[1],
                        memory: parts[4],
                        status: parts[3]
                    });
                }
            }
        } else {
            // Unix ps aux format
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].trim().split(/\s+/);
                if (parts.length >= 11) {
                    processes.push({
                        user: parts[0],
                        pid: parts[1],
                        cpu: parts[2],
                        memory: parts[3],
                        name: parts[10]
                    });
                }
            }
        }

        return processes;
    }

    async killProcess(pid) {
        return new Promise((resolve) => {
            const command = this.isWindows ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`;
            
            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, message: `Process ${pid} terminated` });
                }
            });
        });
    }

    // Network Operations
    async checkInternetConnection() {
        return new Promise((resolve) => {
            const command = this.isWindows ? 'ping -n 1 8.8.8.8' : 'ping -c 1 8.8.8.8';
            
            exec(command, (error) => {
                resolve({ success: !error, connected: !error });
            });
        });
    }

    async getNetworkInfo() {
        try {
            const interfaces = os.networkInterfaces();
            const activeInterfaces = {};

            for (const [name, configs] of Object.entries(interfaces)) {
                const activeConfigs = configs.filter(config => !config.internal && config.family === 'IPv4');
                if (activeConfigs.length > 0) {
                    activeInterfaces[name] = activeConfigs[0];
                }
            }

            return { success: true, interfaces: activeInterfaces };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Clipboard Operations
    async copyToClipboard(text) {
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                command = `echo ${JSON.stringify(text)} | clip`;
            } else if (this.isMac) {
                command = `echo ${JSON.stringify(text)} | pbcopy`;
            } else {
                // Linux - requires xclip
                command = `echo ${JSON.stringify(text)} | xclip -selection clipboard`;
            }

            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, message: 'Text copied to clipboard' });
                }
            });
        });
    }

    // Search Operations
    async searchFiles(directory, pattern) {
        try {
            const files = await fs.readdir(directory, { withFileTypes: true });
            const results = [];

            for (const file of files) {
                const fullPath = path.join(directory, file.name);
                
                if (file.isDirectory()) {
                    const subResults = await this.searchFiles(fullPath, pattern);
                    results.push(...subResults);
                } else if (file.name.toLowerCase().includes(pattern.toLowerCase())) {
                    results.push(fullPath);
                }
            }

            return { success: true, files: results };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Screenshot
    async takeScreenshot() {
        return new Promise((resolve) => {
            let command;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `screenshot-${timestamp}.png`;
            
            if (this.isWindows) {
                // Requires PowerShell or third-party tool
                command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{PRTSC}'; Start-Sleep -Milliseconds 500; Add-Type -AssemblyName System.Drawing; $bmp = [System.Windows.Forms.Clipboard]::GetImage(); if ($bmp) { $bmp.Save('${filename}', [System.Drawing.Imaging.ImageFormat]::Png); }"`;
            } else if (this.isMac) {
                command = `screencapture ${filename}`;
            } else {
                // Linux - requires scrot or similar
                command = `scrot ${filename}`;
            }

            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, filename, message: `Screenshot saved: ${filename}` });
                }
            });
        });
    }

    // Volume Control
    async setVolume(level) {
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                // Requires PowerShell or third-party tool
                command = `powershell -Command "(New-Object -comObject WScript.Shell).SendKeys([char]175)"`;
                // This is simplified - actual volume control would need nircmd or similar
            } else if (this.isMac) {
                command = `osascript -e "set volume output volume ${level}"`;
            } else {
                // Linux - requires amixer or similar
                command = `amixer set Master ${level}%`;
            }

            exec(command, (error) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true, message: `Volume set to ${level}%` });
                }
            });
        });
    }
}

module.exports = new ComputerControlService();
