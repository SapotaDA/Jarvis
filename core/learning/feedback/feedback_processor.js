const LearningDatabase = require('../memory/learning_database');

class FeedbackProcessor {
    constructor() {
        this.learningDB = new LearningDatabase();
        this.feedbackPatterns = {
            positive: ['good', 'great', 'thanks', 'correct', 'yes', 'perfect', 'awesome', 'helpful'],
            negative: ['bad', 'wrong', 'no', 'incorrect', 'terrible', 'useless', 'stupid', 'bad'],
            neutral: ['ok', 'maybe', 'not sure', 'whatever', 'fine']
        };
    }

    // Process user feedback from various sources
    processFeedback(userInput, aiResponse, feedbackType = 'auto') {
        const sentiment = this.analyzeSentiment(userInput);
        const feedbackScore = this.calculateFeedbackScore(sentiment, feedbackType);
        
        // Record the interaction
        const interactionResult = this.learningDB.recordInteraction(
            userInput, 
            aiResponse, 
            Date.now(), 
            feedbackType
        );

        // Record feedback if it's explicit
        if (feedbackType === 'explicit') {
            this.learningDB.recordUserFeedback(interactionResult.lastInsertRowid, feedbackScore);
        }

        // Learn from mistakes
        if (sentiment === 'negative') {
            this.identifyMistakePattern(userInput, aiResponse);
        }

        // Adapt responses based on feedback
        this.adaptResponsePattern(userInput, aiResponse, sentiment);

        return {
            sentiment,
            feedbackScore,
            interactionId: interactionResult.lastInsertRowid
        };
    }

    // Analyze sentiment of user input
    analyzeSentiment(text) {
        const lowerText = text.toLowerCase();
        
        for (const word of this.feedbackPatterns.positive) {
            if (lowerText.includes(word)) return 'positive';
        }
        
        for (const word of this.feedbackPatterns.negative) {
            if (lowerText.includes(word)) return 'negative';
        }
        
        for (const word of this.feedbackPatterns.neutral) {
            if (lowerText.includes(word)) return 'neutral';
        }
        
        return 'neutral';
    }

    // Calculate feedback score
    calculateFeedbackScore(sentiment, feedbackType) {
        const baseScores = {
            'positive': 1.0,
            'neutral': 0.5,
            'negative': 0.0
        };

        const typeMultipliers = {
            'explicit': 1.0,
            'implicit': 0.7,
            'auto': 0.3
        };

        return baseScores[sentiment] * typeMultipliers[feedbackType];
    }

    // Identify mistake patterns
    identifyMistakePattern(userInput, aiResponse) {
        const mistakeType = this.categorizeMistake(userInput, aiResponse);
        const description = this.generateMistakeDescription(userInput, aiResponse);
        
        this.learningDB.recordMistake(mistakeType, description);
    }

    // Categorize types of mistakes
    categorizeMistake(userInput, aiResponse) {
        const input = userInput.toLowerCase();
        const response = aiResponse.toLowerCase();

        if (input.includes('time') && !response.includes('time')) {
            return 'time_query_mistake';
        }
        
        if (input.includes('hello') || input.includes('hi')) {
            return 'greeting_response_error';
        }
        
        if (input.includes('what') && response.includes('i am not sure')) {
            return 'uncertainty_response';
        }
        
        if (input.includes('open') && response.includes('cannot')) {
            return 'action_refusal';
        }

        return 'general_response_error';
    }

    // Generate mistake description
    generateMistakeDescription(userInput, aiResponse) {
        return `Failed to properly respond to: "${userInput.substring(0, 50)}..." with: "${aiResponse.substring(0, 50)}..."`;
    }

    // Adapt response patterns based on feedback
    adaptResponsePattern(userInput, aiResponse, sentiment) {
        if (sentiment === 'positive') {
            // Strengthen successful patterns
            const adaptiveResponse = this.learningDB.getAdaptiveResponse(userInput);
            if (adaptiveResponse) {
                // Update confidence for successful responses
                this.learningDB.updateResponsePerformance(adaptiveResponse.id, true);
            } else {
                // Create new adaptive response for successful patterns
                this.learningDB.addAdaptiveResponse(this.extractPattern(userInput), aiResponse, 0.8);
            }
        } else if (sentiment === 'negative') {
            // Weaken unsuccessful patterns
            const adaptiveResponse = this.learningDB.getAdaptiveResponse(userInput);
            if (adaptiveResponse) {
                this.learningDB.updateResponsePerformance(adaptiveResponse.id, false);
            }
        }
    }

    // Extract key patterns from user input
    extractPattern(userInput) {
        // Simple pattern extraction - can be enhanced with NLP
        const words = userInput.toLowerCase().split(' ');
        const keywords = words.filter(word => 
            word.length > 3 && 
            !['that', 'this', 'with', 'from', 'they', 'have', 'been'].includes(word)
        );
        
        return keywords.slice(0, 3).join(' ');
    }

    // Get feedback analytics
    getFeedbackAnalytics() {
        const analytics = this.learningDB.getLearningAnalytics();
        
        return {
            ...analytics,
            feedbackDistribution: this.getFeedbackDistribution(),
            improvementSuggestions: this.generateImprovementSuggestions()
        };
    }

    // Get distribution of feedback types
    getFeedbackDistribution() {
        const positive = this.learningDB.db.prepare(`
            SELECT COUNT(*) as count FROM learning_interactions 
            WHERE user_feedback > 0
        `).get().count;

        const negative = this.learningDB.db.prepare(`
            SELECT COUNT(*) as count FROM learning_interactions 
            WHERE user_feedback < 0
        `).get().count;

        const total = this.learningDB.db.prepare(`
            SELECT COUNT(*) as count FROM learning_interactions
        `).get().count;

        return {
            positive: positive / total,
            negative: negative / total,
            neutral: (total - positive - negative) / total
        };
    }

    // Generate improvement suggestions based on feedback
    generateImprovementSuggestions() {
        const mistakes = this.learningDB.db.prepare(`
            SELECT pattern_type, mistake_description, frequency 
            FROM mistake_patterns 
            WHERE resolved = FALSE 
            ORDER BY frequency DESC 
            LIMIT 3
        `).all();

        return mistakes.map(mistake => ({
            type: mistake.pattern_type,
            description: mistake.mistake_description,
            frequency: mistake.frequency,
            suggestion: this.getSuggestionForMistake(mistake.pattern_type)
        }));
    }

    // Get specific suggestions for mistake types
    getSuggestionForMistake(mistakeType) {
        const suggestions = {
            'time_query_mistake': 'Always include current time when responding to time-related queries',
            'greeting_response_error': 'Use consistent, friendly greetings for hello/hi inputs',
            'uncertainty_response': 'Provide more confident responses or admit when unsure',
            'action_refusal': 'Explain why actions cannot be performed and suggest alternatives',
            'general_response_error': 'Improve context understanding and response relevance'
        };

        return suggestions[mistakeType] || 'Review and improve response patterns for this category';
    }

    // Process implicit feedback (response time, user behavior patterns)
    processImplicitFeedback(userInput, responseTime, userContinuation = true) {
        // Fast responses with continuation = positive implicit feedback
        if (responseTime < 2000 && userContinuation) {
            return this.processFeedback(userInput, '', 'implicit');
        }
        
        // Slow responses or no continuation = potentially negative feedback
        if (responseTime > 5000 || !userContinuation) {
            return this.processFeedback(userInput, '', 'auto');
        }
        
        return null;
    }

    // Close database connection
    close() {
        this.learningDB.close();
    }
}

module.exports = FeedbackProcessor;
