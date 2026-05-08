const LearningDatabase = require('../../learning/memory/learning_database');

class AdaptiveResponseEngine {
    constructor() {
        this.learningDB = new LearningDatabase();
        this.responseCache = new Map();
        this.contextMemory = [];
        this.maxContextMemory = 10;
    }

    // Main adaptive response generation
    async generateAdaptiveResponse(userInput, context = null) {
        const startTime = Date.now();
        
        try {
            // 1. Check for learned adaptive responses first
            const adaptiveResponse = this.learningDB.getAdaptiveResponse(userInput);
            if (adaptiveResponse && adaptiveResponse.confidence_score > 0.7) {
                this.updateContext(userInput, adaptiveResponse.learned_response);
                return {
                    response: adaptiveResponse.learned_response,
                    source: 'adaptive',
                    confidence: adaptiveResponse.confidence_score,
                    response_time: Date.now() - startTime
                };
            }

            // 2. Check response cache
            const cachedResponse = this.getCachedResponse(userInput);
            if (cachedResponse) {
                this.updateContext(userInput, cachedResponse.response);
                return {
                    ...cachedResponse,
                    source: 'cache',
                    response_time: Date.now() - startTime
                };
            }

            // 3. Generate contextual response
            const contextualResponse = this.generateContextualResponse(userInput, context);
            
            // 4. Cache the response
            this.cacheResponse(userInput, contextualResponse);
            
            // 5. Update context memory
            this.updateContext(userInput, contextualResponse.response);

            return {
                ...contextualResponse,
                response_time: Date.now() - startTime
            };

        } catch (error) {
            console.error('Error in adaptive response generation:', error);
            return this.getFallbackResponse(userInput);
        }
    }

    // Generate contextual response based on conversation history
    generateContextualResponse(userInput, context) {
        const input = userInput.toLowerCase();
        const recentContext = this.getRelevantContext(input);

        // Time-based responses
        if (input.includes('time') || input.includes('what time')) {
            return {
                response: `The current time is ${new Date().toLocaleTimeString()}.`,
                source: 'contextual',
                confidence: 0.9,
                type: 'time_query'
            };
        }

        // Greeting responses with context awareness
        if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
            if (recentContext.length > 0) {
                return {
                    response: 'Welcome back, Sir. I am ready to continue assisting you.',
                    source: 'contextual',
                    confidence: 0.8,
                    type: 'greeting_returning'
                };
            } else {
                return {
                    response: 'Hello Sir. JARVIS is online and ready to assist you.',
                    source: 'contextual',
                    confidence: 0.8,
                    type: 'greeting_initial'
                };
            }
        }

        // Farewell responses
        if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
            return {
                response: 'Goodbye, Sir. I will be here when you need me.',
                source: 'contextual',
                confidence: 0.8,
                type: 'farewell'
            };
        }

        // Thank you responses
        if (input.includes('thank') || input.includes('thanks')) {
            return {
                response: 'You are welcome, Sir. It is my pleasure to assist.',
                source: 'contextual',
                confidence: 0.8,
                type: 'acknowledgment'
            };
        }

        // How are you responses
        if (input.includes('how are') || input.includes('how do')) {
            return {
                response: 'I am functioning optimally, Sir. My systems are continuously learning and improving.',
                source: 'contextual',
                confidence: 0.7,
                type: 'status_inquiry'
            };
        }

        // Action requests with enhanced explanations
        if (input.includes('open') || input.includes('start') || input.includes('launch')) {
            const app = this.extractAppName(input);
            return {
                response: `I understand you want to open ${app}. While I can process your request, my current focus is on voice commands and intelligent responses. You may need to open ${app} manually, Sir.`,
                source: 'contextual',
                confidence: 0.6,
                type: 'action_request'
            };
        }

        // Help requests
        if (input.includes('help') || input.includes('what can')) {
            return {
                response: 'I can assist you with information, time queries, conversations, and continuously learn from our interactions. My capabilities are expanding through our conversations.',
                source: 'contextual',
                confidence: 0.7,
                type: 'help_request'
            };
        }

        // Learning-related questions
        if (input.includes('learn') || input.includes('remember') || input.includes('know')) {
            return {
                response: 'I am continuously learning from our interactions, Sir. Each conversation helps me improve my responses and better understand your preferences.',
                source: 'contextual',
                confidence: 0.7,
                type: 'learning_inquiry'
            };
        }

        // Default intelligent response
        return {
            response: this.generateIntelligentDefault(input, recentContext),
            source: 'contextual',
            confidence: 0.5,
            type: 'intelligent_default'
        };
    }

    // Generate more intelligent default responses
    generateIntelligentDefault(input, context) {
        // Check if user is asking about previous topics
        if (context.length > 0 && (input.includes('that') || input.includes('it'))) {
            return `I recall our previous discussion, Sir. Could you clarify which aspect you'd like me to address further?`;
        }

        // Check for questions
        if (input.includes('?') || input.includes('what') || input.includes('how') || input.includes('why') || input.includes('where')) {
            return `I'm processing your question, Sir. My systems are analyzing the best way to assist you with this inquiry.`;
        }

        // Check for statements or observations
        if (input.length > 10 && !input.includes('?')) {
            return `I understand your statement, Sir. I'm learning from our interactions to provide better responses.`;
        }

        // Short inputs
        return `I'm here to assist you, Sir. Please let me know how I can help with your request.`;
    }

    // Extract app name from action requests
    extractAppName(input) {
        const apps = ['chrome', 'firefox', 'notepad', 'calculator', 'explorer', 'cmd', 'terminal', 'word', 'excel'];
        
        for (const app of apps) {
            if (input.toLowerCase().includes(app)) {
                return app;
            }
        }
        
        return 'the application';
    }

    // Get relevant context from memory
    getRelevantContext(input) {
        // Simple context retrieval - can be enhanced with semantic search
        return this.contextMemory.slice(-3); // Last 3 interactions
    }

    // Update context memory
    updateContext(userInput, aiResponse) {
        this.contextMemory.push({
            user_input: userInput,
            ai_response: aiResponse,
            timestamp: Date.now()
        });

        // Keep only recent context
        if (this.contextMemory.length > this.maxContextMemory) {
            this.contextMemory = this.contextMemory.slice(-this.maxContextMemory);
        }
    }

    // Cache responses for faster retrieval
    cacheResponse(userInput, response) {
        const key = this.generateCacheKey(userInput);
        this.responseCache.set(key, {
            ...response,
            cached_at: Date.now()
        });

        // Limit cache size
        if (this.responseCache.size > 100) {
            const oldestKey = this.responseCache.keys().next().value;
            this.responseCache.delete(oldestKey);
        }
    }

    // Get cached response
    getCachedResponse(userInput) {
        const key = this.generateCacheKey(userInput);
        const cached = this.responseCache.get(key);
        
        if (cached && (Date.now() - cached.cached_at) < 300000) { // 5 minutes cache
            return cached;
        }
        
        return null;
    }

    // Generate cache key
    generateCacheKey(input) {
        return input.toLowerCase().trim().substring(0, 50);
    }

    // Get fallback response
    getFallbackResponse(userInput) {
        return {
            response: 'I am processing your request, Sir. My systems are optimizing to provide better assistance.',
            source: 'fallback',
            confidence: 0.3,
            response_time: 0,
            type: 'fallback'
        };
    }

    // Learn from user feedback
    learnFromFeedback(userInput, aiResponse, feedback) {
        const feedbackScore = feedback > 0 ? 1.0 : 0.0;
        
        // Update adaptive response database
        this.learningDB.addAdaptiveResponse(
            this.generateCacheKey(userInput), 
            aiResponse, 
            feedbackScore
        );

        // Record the learning interaction
        this.learningDB.recordInteraction(userInput, aiResponse, 0, 'feedback_learning');
        this.learningDB.recordUserFeedback(
            this.learningDB.db.prepare('SELECT MAX(id) as id FROM learning_interactions').get().id,
            feedback
        );
    }

    // Get response analytics
    getResponseAnalytics() {
        const analytics = this.learningDB.getLearningAnalytics();
        
        return {
            ...analytics,
            cache_size: this.responseCache.size,
            context_memory_size: this.contextMemory.length,
            most_used_patterns: this.getMostUsedPatterns()
        };
    }

    // Get most used response patterns
    getMostUsedPatterns() {
        return this.learningDB.db.prepare(`
            SELECT trigger_pattern, usage_count, success_rate 
            FROM adaptive_responses 
            ORDER BY usage_count DESC 
            LIMIT 5
        `).all();
    }

    // Clear cache and context
    clearMemory() {
        this.responseCache.clear();
        this.contextMemory = [];
    }

    // Export learning data
    exportLearningData() {
        return {
            context_memory: this.contextMemory,
            cache_keys: Array.from(this.responseCache.keys()),
            analytics: this.getResponseAnalytics()
        };
    }

    // Close connections
    close() {
        this.learningDB.close();
    }
}

module.exports = AdaptiveResponseEngine;
