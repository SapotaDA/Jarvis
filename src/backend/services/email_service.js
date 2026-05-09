const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
    constructor() {
        this.platform = process.platform;
        this.isWindows = this.platform === 'win32';
        this.isMac = this.platform === 'darwin';
        this.isLinux = this.platform === 'linux';
    }

    async sendEmail(options) {
        const {
            to,
            subject,
            body,
            cc = null,
            bcc = null,
            attachments = null
        } = options;

        try {
            if (this.isWindows) {
                return await this.sendEmailWindows(options);
            } else if (this.isMac) {
                return await this.sendEmailMac(options);
            } else {
                return await this.sendEmailLinux(options);
            }
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, error: error.message };
        }
    }

    async sendEmailWindows(options) {
        const { to, subject, body, cc, bcc } = options;
        
        // Use PowerShell to send email via default mail client
        const psScript = `
            $email = New-Object -ComObject CDO.Message
            $email.From = "jarvis@localhost"
            $email.To = "${to}"
            $email.Subject = "${subject}"
            $email.TextBody = "${body.replace(/"/g, '""')}"
            ${cc ? `$email.CC = "${cc}"` : ''}
            ${bcc ? `$email.BCC = "${bcc}"` : ''}
            
            try {
                $email.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusing") = 2
                $email.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserver") = "smtp.gmail.com"
                $email.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserverport") = 587
                $email.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate") = 1
                $email.Configuration.Fields.Update()
                $email.Send()
                Write-Output "Email sent successfully"
            } catch {
                # Fallback to opening default mail client
                $mailto = "mailto:${to}"
                $subject = "?subject=${subject}"
                $body = "&body=${body}"
                $fullUrl = $mailto + $subject + $body
                Start-Process $fullUrl
                Write-Output "Opened default mail client"
            }
        `;

        return new Promise((resolve) => {
            const powershell = spawn('powershell.exe', ['-Command', psScript]);
            
            powershell.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, message: 'Email sent successfully' });
                } else {
                    resolve({ success: false, error: 'Failed to send email' });
                }
            });
            
            powershell.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }

    async sendEmailMac(options) {
        const { to, subject, body } = options;
        
        // Use mailto: protocol to open default mail client
        const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        return new Promise((resolve) => {
            const open = spawn('open', [mailtoUrl]);
            
            open.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, message: 'Opened default mail client with email' });
                } else {
                    resolve({ success: false, error: 'Failed to open mail client' });
                }
            });
            
            open.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }

    async sendEmailLinux(options) {
        const { to, subject, body } = options;
        
        // Use xdg-open to open default mail client
        const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        return new Promise((resolve) => {
            const open = spawn('xdg-open', [mailtoUrl]);
            
            open.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, message: 'Opened default mail client with email' });
                } else {
                    resolve({ success: false, error: 'Failed to open mail client' });
                }
            });
            
            open.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }

    async createEmailDraft(options) {
        const { to, subject, body, attachments = [] } = options;
        
        try {
            const draftContent = this.createEmailContent(to, subject, body, attachments);
            const draftPath = path.join(__dirname, '../../../temp/email_draft.eml');
            
            // Ensure temp directory exists
            await fs.mkdir(path.dirname(draftPath), { recursive: true });
            await fs.writeFile(draftPath, draftContent);
            
            // Open the draft file
            if (this.isWindows) {
                await this.openApplication(draftPath);
            } else if (this.isMac) {
                await this.openApplication(draftPath);
            } else {
                await this.openApplication(draftPath);
            }
            
            return { success: true, message: 'Email draft created and opened' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    createEmailContent(to, subject, body, attachments) {
        let content = `To: ${to}\n`;
        content += `Subject: ${subject}\n`;
        content += `MIME-Version: 1.0\n`;
        content += `Content-Type: text/plain; charset=utf-8\n\n`;
        content += body;
        
        return content;
    }

    async openApplication(appPath) {
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                command = `start "" "${appPath}"`;
            } else if (this.isMac) {
                command = `open "${appPath}"`;
            } else {
                command = `xdg-open "${appPath}"`;
            }

            const child = spawn(command, { shell: true });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, message: `Opened: ${appPath}` });
                } else {
                    resolve({ success: false, error: `Failed to open: ${appPath}` });
                }
            });
            
            child.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }

    async searchApplications(query) {
        const commonApps = {
            'chrome': 'chrome.exe',
            'firefox': 'firefox.exe',
            'edge': 'msedge.exe',
            'notepad': 'notepad.exe',
            'word': 'winword.exe',
            'excel': 'excel.exe',
            'powerpoint': 'powerpnt.exe',
            'outlook': 'outlook.exe',
            'calculator': 'calc.exe',
            'paint': 'mspaint.exe',
            'cmd': 'cmd.exe',
            'terminal': 'wt.exe', // Windows Terminal
            'explorer': 'explorer.exe',
            'control': 'control.exe',
            'taskmgr': 'taskmgr.exe',
            'devmgmt': 'devmgmt.msc',
            'services': 'services.msc',
            'regedit': 'regedit.exe'
        };

        const queryLower = query.toLowerCase();
        
        // Direct match
        if (commonApps[queryLower]) {
            return { success: true, app: commonApps[queryLower], type: 'direct' };
        }
        
        // Partial match
        for (const [key, value] of Object.entries(commonApps)) {
            if (key.includes(queryLower) || queryLower.includes(key)) {
                return { success: true, app: value, type: 'partial' };
            }
        }
        
        // Try to find executable in common paths
        const commonPaths = [
            'C:\\Program Files\\',
            'C:\\Program Files (x86)\\',
            'C:\\Users\\%USERNAME%\\AppData\\Local\\',
            'C:\\Users\\%USERNAME%\\AppData\\Roaming\\'
        ];
        
        return { success: false, error: `Application '${query}' not found` };
    }

    async openAnyApplication(query) {
        try {
            // First try to find the application
            const appSearch = await this.searchApplications(query);
            
            if (appSearch.success) {
                return await this.openApplication(appSearch.app);
            }
            
            // If not found, try to open as file or URL
            if (query.startsWith('http://') || query.startsWith('https://') || query.startsWith('www.')) {
                return await this.openURL(query);
            }
            
            // Try to open as file path
            try {
                await fs.access(query);
                return await this.openApplication(query);
            } catch (error) {
                // File doesn't exist, try to search for it
                return { success: false, error: `Could not find application or file: ${query}` };
            }
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async openURL(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }
        
        return new Promise((resolve) => {
            let command;
            
            if (this.isWindows) {
                command = `start "" "${url}"`;
            } else if (this.isMac) {
                command = `open "${url}"`;
            } else {
                command = `xdg-open "${url}"`;
            }

            const child = spawn(command, { shell: true });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, message: `Opened URL: ${url}` });
                } else {
                    resolve({ success: false, error: `Failed to open URL: ${url}` });
                }
            });
            
            child.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }

    // Quick email templates
    getEmailTemplates() {
        return {
            meeting: {
                subject: 'Meeting Request',
                body: 'Dear Sir,\n\nI would like to schedule a meeting to discuss the following:\n\n[Add your agenda here]\n\nPlease let me know your availability.\n\nBest regards,\nJARVIS'
            },
            report: {
                subject: 'System Report',
                body: 'Dear Sir,\n\nPlease find the system report below:\n\n[Add report details here]\n\nLet me know if you need any additional information.\n\nBest regards,\nJARVIS'
            },
            reminder: {
                subject: 'Reminder',
                body: 'Dear Sir,\n\nThis is a reminder about:\n\n[Add reminder details here]\n\nPlease take the necessary action.\n\nBest regards,\nJARVIS'
            },
            update: {
                subject: 'Status Update',
                body: 'Dear Sir,\n\nHere is the current status update:\n\n[Add update details here]\n\nI will keep you informed of any changes.\n\nBest regards,\nJARVIS'
            }
        };
    }

    async sendTemplateEmail(template, to, customizations = {}) {
        const templates = this.getEmailTemplates();
        const templateData = templates[template];
        
        if (!templateData) {
            return { success: false, error: `Template '${template}' not found` };
        }
        
        const emailOptions = {
            to,
            subject: customizations.subject || templateData.subject,
            body: customizations.body || templateData.body,
            ...customizations
        };
        
        return await this.sendEmail(emailOptions);
    }
}

module.exports = new EmailService();
