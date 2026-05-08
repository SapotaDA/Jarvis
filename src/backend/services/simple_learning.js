const { addMemory, getMemories } = require('./db');

class SimpleLearningSystem {
    constructor() {
        this.learnedResponses = new Map();
        this.userPreferences = new Map();
        this.interactionCount = 0;
        this.successCount = 0;
    }

    // Generate adaptive response with learning
    generateAdaptiveResponse(userInput, fallbackResponse) {
        this.interactionCount++;
        
        // Check for learned patterns
        const learnedResponse = this.getLearnedResponse(userInput);
        if (learnedResponse) {
            this.successCount++;
            return {
                response: learnedResponse,
                source: 'learned',
                confidence: 0.8
            };
        }

        // Check for common patterns and learn them
        const patternResponse = this.getPatternResponse(userInput);
        if (patternResponse) {
            this.learnResponse(userInput, patternResponse);
            return {
                response: patternResponse,
                source: 'pattern',
                confidence: 0.7
            };
        }

        // Use fallback response
        return {
            response: fallbackResponse,
            source: 'fallback',
            confidence: 0.5
        };
    }

    // Get learned response for input
    getLearnedResponse(userInput) {
        const input = userInput.toLowerCase().trim();
        
        // Direct match
        if (this.learnedResponses.has(input)) {
            return this.learnedResponses.get(input);
        }

        // Pattern match
        for (const [pattern, response] of this.learnedResponses) {
            if (input.includes(pattern) || pattern.includes(input)) {
                return response;
            }
        }

        return null;
    }

    // Get pattern-based response
    getPatternResponse(userInput) {
        const input = userInput.toLowerCase();

        // Time queries
        if (input.includes('time') || input.includes('what time')) {
            return `The current time is ${new Date().toLocaleTimeString()}.`;
        }

        // Greetings
        if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
            return 'Hello Sir. JARVIS is online and ready to assist you.';
        }

        // How are you
        if (input.includes('how are') || input.includes('how do')) {
            return 'I am functioning optimally, Sir. My systems are continuously learning from our interactions.';
        }

        // Thank you
        if (input.includes('thank') || input.includes('thanks')) {
            return 'You are welcome, Sir. It is my pleasure to assist.';
        }

        // Goodbye
        if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
            return 'Goodbye, Sir. I will be here when you need me.';
        }

        // Learning questions
        if (input.includes('learn') || input.includes('remember') || input.includes('know')) {
            return 'I am continuously learning from our interactions, Sir. Each conversation helps me improve my responses and better understand your preferences.';
        }

        // Help requests
        if (input.includes('help') || input.includes('what can')) {
            return 'I can assist you with information, time queries, conversations, and continuously learn from our interactions. My capabilities are expanding through our conversations.';
        }

        return null;
    }

    // Learn new response
    learnResponse(userInput, response) {
        const input = userInput.toLowerCase().trim();
        this.learnedResponses.set(input, response);
        
        // Also store in database for persistence
        addMemory(`LEARNED: Input "${input}" -> Response "${response}"`, 'learning');
    }

    // Process user feedback
    processFeedback(userInput, aiResponse, feedback) {
        if (feedback > 0) {
            // Positive feedback - strengthen the response
            this.learnResponse(userInput, aiResponse);
            this.successCount++;
        } else {
            // Negative feedback - weaken or remove the response
            const input = userInput.toLowerCase().trim();
            this.learnedResponses.delete(input);
        }

        // Store feedback in database
        addMemory(`FEEDBACK: "${userInput}" -> "${aiResponse}" (${feedback > 0 ? 'Positive' : 'Negative'})`, 'feedback');
    }

    // Get learning statistics
    getLearningStats() {
        return {
            total_interactions: this.interactionCount,
            successful_responses: this.successCount,
            success_rate: this.interactionCount > 0 ? this.successCount / this.interactionCount : 0,
            learned_responses: this.learnedResponses.size,
            user_preferences: Array.from(this.userPreferences.entries())
        };
    }

    // Update user preferences
    updatePreference(key, value) {
        this.userPreferences.set(key, value);
        addMemory(`PREFERENCE: ${key} = ${value}`, 'preference');
    }

    // Get user preference
    getPreference(key, defaultValue = null) {
        return this.userPreferences.get(key) || defaultValue;
    }

    // Export learning data
    exportLearningData() {
        return {
            learned_responses: Object.fromEntries(this.learnedResponses),
            user_preferences: Object.fromEntries(this.userPreferences),
            statistics: this.getLearningStats(),
            timestamp: new Date().toISOString()
        };
    }

    // Import learning data
    importLearningData(data) {
        if (data.learned_responses) {
            this.learnedResponses = new Map(Object.entries(data.learned_responses));
        }
        if (data.user_preferences) {
            this.userPreferences = new Map(Object.entries(data.user_preferences));
        }
    }

    // Reset learning system
    reset() {
        this.learnedResponses.clear();
        this.userPreferences.clear();
        this.interactionCount = 0;
        this.successCount = 0;
        addMemory('LEARNING SYSTEM RESET', 'system');
    }
}

module.exports = new SimpleLearningSystem();
