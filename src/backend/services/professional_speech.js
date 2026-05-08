class ProfessionalSpeechService {
    constructor() {
        this.professionalFilters = [
            // HTML tags and markdown
            { pattern: /<[^>]*>/g, replacement: '' },
            { pattern: /\*\*([^*]+)\*\*/g, replacement: '$1' },
            { pattern: /\*([^*]+)\*/g, replacement: '$1' },
            { pattern: /_([^_]+)_/g, replacement: '$1' },
            { pattern: /`([^`]+)`/g, replacement: '$1' },
            { pattern: /#{1,6}\s+/g, replacement: '' },
            
            // Technical symbols and punctuation
            { pattern: /\//g, replacement: ' ' },
            { pattern: /\\/g, replacement: ' ' },
            { pattern: /\|/g, replacement: ' ' },
            { pattern: /&/g, replacement: ' and ' },
            { pattern: /@/g, replacement: ' at ' },
            { pattern: /#/g, replacement: ' number ' },
            { pattern: /\$/g, replacement: ' dollars ' },
            { pattern: /%/g, replacement: ' percent ' },
            { pattern: /\+/g, replacement: ' plus ' },
            { pattern: /=/g, replacement: ' equals ' },
            { pattern: /-/g, replacement: ' ' },
            { pattern: /_/g, replacement: ' ' },
            
            // URLs and links
            { pattern: /https?:\/\/[^\s]+/g, replacement: 'website link' },
            { pattern: /www\.[^\s]+/g, replacement: 'website link' },
            
            // Email addresses
            { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: 'email address' },
            
            // Code snippets and technical terms
            { pattern: /\b[A-Z]{2,}\b/g, replacement: (match) => this.spellAcronym(match) },
            { pattern: /\b\w+_\w+\b/g, replacement: (match) => match.replace(/_/g, ' ') },
            
            // Numbers and special formatting
            { pattern: /\b\d{1,3}(,\d{3})*(\.\d+)?\b/g, replacement: (match) => this.speakNumber(match) },
            { pattern: /\b\d+\/\d+\b/g, replacement: (match) => match.replace('/', ' out of ') },
            
            // Excessive punctuation
            { pattern: /[!]{2,}/g, replacement: '!' },
            { pattern: /[?]{2,}/g, replacement: '?' },
            { pattern: /[.]{2,}/g, replacement: '.' },
            
            // Emojis and special characters
            { pattern: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, replacement: '' },
            
            // Common technical abbreviations
            { pattern: /\bAPI\b/g, replacement: 'A P I' },
            { pattern: /\bUI\b/g, replacement: 'U I' },
            { pattern: /\bUX\b/g, replacement: 'U X' },
            { pattern: /\bCPU\b/g, replacement: 'C P U' },
            { pattern: /\bGPU\b/g, replacement: 'G P U' },
            { pattern: /\bRAM\b/g, replacement: 'R A M' },
            { pattern: /\bSSD\b/g, replacement: 'S S D' },
            { pattern: /\bHDD\b/g, replacement: 'H D D' },
            { pattern: /\bGB\b/g, replacement: 'gigabytes' },
            { pattern: /\bMB\b/g, replacement: 'megabytes' },
            { pattern: /\bKB\b/g, replacement: 'kilobytes' },
            { pattern: /\bTB\b/g, replacement: 'terabytes' },
            
            // File extensions
            { pattern: /\.\w{2,4}\b/g, replacement: '' },
            
            // Clean up extra spaces
            { pattern: /\s+/g, replacement: ' ' },
            { pattern: /^\s+|\s+$/g, replacement: '' }
        ];
        
        this.professionalReplacements = [
            // Common unprofessional phrases to professional alternatives
            { pattern: /um|uh|er|ah/gi, replacement: '' },
            { pattern: /\blike\b/gi, replacement: 'such as' },
            { pattern: /\bstuff\b/gi, replacement: 'items' },
            { pattern: /\bthing\b/gi, replacement: 'item' },
            { pattern: /\bthings\b/gi, replacement: 'items' },
            { pattern: /\bguys\b/gi, replacement: 'everyone' },
            { pattern: /\byou know\b/gi, replacement: '' },
            { pattern: /\bI mean\b/gi, replacement: '' },
            { pattern: /\byeah\b/gi, replacement: 'yes' },
            { pattern: /\bnope\b/gi, replacement: 'no' },
            { pattern: /\bsure\b/gi, replacement: 'certainly' },
            { pattern: /\bcool\b/gi, replacement: 'excellent' },
            { pattern: /\bawesome\b/gi, replacement: 'outstanding' },
            { pattern: /\bokay\b/gi, replacement: 'understood' },
            { pattern: /\bok\b/gi, replacement: 'understood' },
            { pattern: /\bgot it\b/gi, replacement: 'understood' },
            { pattern: /\bgotcha\b/gi, replacement: 'understood' },
            { pattern: /\bno problem\b/gi, replacement: 'certainly' },
            { pattern: /\bnp\b/gi, replacement: 'certainly' },
            { pattern: /\bthanks\b/gi, replacement: 'thank you' },
            { pattern: /\bthx\b/gi, replacement: 'thank you' },
            { pattern: /\bpls\b/gi, replacement: 'please' },
            { pattern: /\bplz\b/gi, replacement: 'please' },
            { pattern: /\basap\b/gi, replacement: 'as soon as possible' },
            
            // JARVIS-specific professional phrases
            { pattern: /sir/gi, replacement: 'Sir' },
            { pattern: /\bI'm\b/gi, replacement: 'I am' },
            { pattern: /\bI'll\b/gi, replacement: 'I will' },
            { pattern: /\bI've\b/gi, replacement: 'I have' },
            { pattern: /\bI'd\b/gi, replacement: 'I would' },
            { pattern: /\bcan't\b/gi, replacement: 'cannot' },
            { pattern: /\bwon't\b/gi, replacement: 'will not' },
            { pattern: /\bdon't\b/gi, replacement: 'do not' },
            { pattern: /\bdoesn't\b/gi, replacement: 'does not' },
            { pattern: /\bisn't\b/gi, replacement: 'is not' },
            { pattern: /\baren't\b/gi, replacement: 'are not' },
            { pattern: /\bwasn't\b/gi, replacement: 'was not' },
            { pattern: /\bweren't\b/gi, replacement: 'were not' },
            { pattern: /\bshouldn't\b/gi, replacement: 'should not' },
            { pattern: /\bwouldn't\b/gi, replacement: 'would not' },
            { pattern: /\bcouldn't\b/gi, replacement: 'could not' },
            { pattern: /\bmustn't\b/gi, replacement: 'must not' },
            { pattern: /\bmightn't\b/gi, replacement: 'might not' },
            { pattern: /\bneedn't\b/gi, replacement: 'need not' }
        ];
    }

    processForSpeech(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let processedText = text;
        
        // Apply professional filters
        for (const filter of this.professionalFilters) {
            processedText = processedText.replace(filter.pattern, filter.replacement);
        }
        
        // Apply professional replacements
        for (const replacement of this.professionalReplacements) {
            processedText = processedText.replace(replacement.pattern, replacement.replacement);
        }
        
        // Add proper punctuation and spacing
        processedText = this.addProperPunctuation(processedText);
        
        // Ensure professional tone
        processedText = this.ensureProfessionalTone(processedText);
        
        return processedText.trim();
    }

    addProperPunctuation(text) {
        // Add proper sentence endings
        if (!text.match(/[.!?]$/)) {
            text += '.';
        }
        
        // Ensure proper spacing after punctuation
        text = text.replace(/([.!?])([A-Z])/g, '$1 $2');
        text = text.replace(/([,;:])([A-Za-z])/g, '$1 $2');
        
        // Remove excess spaces
        text = text.replace(/\s+/g, ' ');
        text = text.replace(/\s+([.!?])/g, '$1');
        
        return text;
    }

    ensureProfessionalTone(text) {
        // Ensure sentences start with capital letters
        text = text.replace(/([.!?]\s+)([a-z])/g, (match, punctuation, letter) => {
            return punctuation + letter.toUpperCase();
        });
        
        // Ensure first letter is capitalized
        if (text.length > 0) {
            text = text[0].toUpperCase() + text.slice(1);
        }
        
        return text;
    }

    spellAcronym(acronym) {
        return acronym.split('').join(' ');
    }

    speakNumber(number) {
        // Convert numbers to words for better speech
        const num = parseFloat(number.replace(/,/g, ''));
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + ' million';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + ' thousand';
        } else {
            return num.toString();
        }
    }

    // Professional response templates
    getProfessionalResponse(category, data) {
        const responses = {
            greeting: [
                "Good day, Sir. How may I assist you today?",
                "Welcome back, Sir. I am ready to help.",
                "Greetings, Sir. What can I do for you?"
            ],
            system_info: [
                "System status: All systems operational and functioning normally.",
                "Current system parameters indicate optimal performance.",
                "System diagnostics show all components are functioning correctly."
            ],
            computer_control: [
                "Command executed successfully, Sir.",
                "Task completed as requested, Sir.",
                "Operation completed successfully, Sir."
            ],
            news: [
                "Here are the latest updates for your review, Sir.",
                "Current news headlines are now available, Sir.",
                "I have retrieved the latest information for you, Sir."
            ],
            error: [
                "I apologize, Sir. I encountered an issue processing that request.",
                "There appears to be a technical difficulty, Sir. Please try again.",
                "I am unable to complete that request at this moment, Sir."
            ],
            confirmation: [
                "Understood, Sir. I will proceed with that action.",
                "Confirmed, Sir. The task will be completed shortly.",
                "Acknowledged, Sir. Your request has been received."
            ]
        };
        
        const categoryResponses = responses[category] || responses.greeting;
        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }

    // Filter out inappropriate content
    filterInappropriateContent(text) {
        const inappropriatePatterns = [
            /\b(damn|hell|crap|shit|fuck|bitch|ass)\b/gi,
            /\b(stupid|idiot|dumb|moron)\b/gi
        ];
        
        let filteredText = text;
        for (const pattern of inappropriatePatterns) {
            filteredText = filteredText.replace(pattern, '***');
        }
        
        return filteredText;
    }

    // Add natural pauses for better speech
    addNaturalPauses(text) {
        // Add pauses after commas and before important points
        text = text.replace(/,/g, ', <pause>');
        text = text.replace(/\./g, '. <pause>');
        text = text.replace(/\?/g, '? <pause>');
        text = text.replace(/!/g, '! <pause>');
        
        return text;
    }

    // Main processing function
    processForProfessionalSpeech(text, context = {}) {
        if (!text) return '';
        
        // Step 1: Filter inappropriate content
        let processedText = this.filterInappropriateContent(text);
        
        // Step 2: Apply professional filters
        processedText = this.processForSpeech(processedText);
        
        // Step 3: Add context-specific professional tone
        if (context.category) {
            const professionalResponse = this.getProfessionalResponse(context.category, context.data);
            if (processedText.length < 20) {
                processedText = professionalResponse;
            }
        }
        
        // Step 4: Add natural pauses for speech synthesis
        processedText = this.addNaturalPauses(processedText);
        
        // Step 5: Final cleanup
        processedText = processedText.replace(/\s*<pause>\s*/g, '<pause>');
        processedText = processedText.replace(/<pause>+/g, '<pause>');
        
        return processedText;
    }
}

module.exports = new ProfessionalSpeechService();
