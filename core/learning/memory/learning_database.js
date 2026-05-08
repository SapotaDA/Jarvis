const Database = require('better-sqlite3');
const path = require('path');

class LearningDatabase {
    constructor() {
        this.db = new Database(path.join(__dirname, '../../../server/jarvis_memory.db'));
        this.initializeTables();
    }

    initializeTables() {
        // Learning and adaptation tables
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS learning_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_input TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                user_feedback INTEGER DEFAULT 0,
                context TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                success_score REAL DEFAULT 0.0,
                response_time INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS mistake_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_type TEXT NOT NULL,
                mistake_description TEXT NOT NULL,
                correction_applied TEXT,
                frequency INTEGER DEFAULT 1,
                last_occurrence DATETIME DEFAULT CURRENT_TIMESTAMP,
                resolved BOOLEAN DEFAULT FALSE
            );

            CREATE TABLE IF NOT EXISTS adaptive_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trigger_pattern TEXT NOT NULL,
                learned_response TEXT NOT NULL,
                confidence_score REAL DEFAULT 0.0,
                usage_count INTEGER DEFAULT 0,
                success_rate REAL DEFAULT 0.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS performance_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_type TEXT NOT NULL,
                metric_value REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                context TEXT
            );

            CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                preference_key TEXT UNIQUE NOT NULL,
                preference_value TEXT NOT NULL,
                confidence REAL DEFAULT 0.0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    // Record learning interactions
    recordInteraction(userInput, aiResponse, responseTime, context = null) {
        const stmt = this.db.prepare(`
            INSERT INTO learning_interactions 
            (user_input, ai_response, response_time, context) 
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(userInput, aiResponse, responseTime, context);
    }

    // Record user feedback (positive/negative)
    recordUserFeedback(interactionId, feedback) {
        const stmt = this.db.prepare(`
            UPDATE learning_interactions 
            SET user_feedback = ?, success_score = ?
            WHERE id = ?
        `);
        const successScore = feedback > 0 ? 1.0 : 0.0;
        return stmt.run(feedback, successScore, interactionId);
    }

    // Track mistake patterns
    recordMistake(patternType, description, correction = null) {
        // Check if this pattern already exists
        const existing = this.db.prepare(`
            SELECT id, frequency FROM mistake_patterns 
            WHERE pattern_type = ? AND mistake_description = ?
        `).get(patternType, description);

        if (existing) {
            // Update frequency and last occurrence
            const stmt = this.db.prepare(`
                UPDATE mistake_patterns 
                SET frequency = frequency + 1, 
                    last_occurrence = CURRENT_TIMESTAMP,
                    resolved = FALSE
                WHERE id = ?
            `);
            return stmt.run(existing.id);
        } else {
            // Create new mistake record
            const stmt = this.db.prepare(`
                INSERT INTO mistake_patterns 
                (pattern_type, mistake_description, correction_applied) 
                VALUES (?, ?, ?)
            `);
            return stmt.run(patternType, description, correction);
        }
    }

    // Add adaptive responses
    addAdaptiveResponse(triggerPattern, response, confidence = 0.5) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO adaptive_responses 
            (trigger_pattern, learned_response, confidence_score, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        return stmt.run(triggerPattern, response, confidence);
    }

    // Get learned responses for patterns
    getAdaptiveResponse(userInput) {
        const stmt = this.db.prepare(`
            SELECT learned_response, confidence_score, usage_count, success_rate
            FROM adaptive_responses 
            WHERE ? LIKE '%' || trigger_pattern || '%'
            ORDER BY confidence_score DESC, success_rate DESC
            LIMIT 1
        `);
        return stmt.get(userInput);
    }

    // Update response performance
    updateResponsePerformance(responseId, success) {
        const stmt = this.db.prepare(`
            UPDATE adaptive_responses 
            SET usage_count = usage_count + 1,
                success_rate = ((success_rate * (usage_count - 1)) + ?) / usage_count,
                confidence_score = CASE 
                    WHEN ? > 0 THEN MIN(confidence_score + 0.1, 1.0)
                    ELSE MAX(confidence_score - 0.05, 0.1)
                END
            WHERE id = ?
        `);
        return stmt.run(success ? 1 : 0, success ? 1 : 0, responseId);
    }

    // Record performance metrics
    recordMetric(metricType, value, context = null) {
        const stmt = this.db.prepare(`
            INSERT INTO performance_metrics (metric_type, metric_value, context) 
            VALUES (?, ?, ?)
        `);
        return stmt.run(metricType, value, context);
    }

    // Get learning analytics
    getLearningAnalytics() {
        const analytics = {
            totalInteractions: this.db.prepare('SELECT COUNT(*) as count FROM learning_interactions').get().count,
            averageResponseTime: this.db.prepare('SELECT AVG(response_time) as avg FROM learning_interactions').get().avg,
            successRate: this.db.prepare('SELECT AVG(success_score) as rate FROM learning_interactions').get().rate,
            totalMistakes: this.db.prepare('SELECT COUNT(*) as count FROM mistake_patterns WHERE resolved = FALSE').get().count,
            adaptiveResponses: this.db.prepare('SELECT COUNT(*) as count FROM adaptive_responses').get().count,
            topMistakes: this.db.prepare(`
                SELECT pattern_type, mistake_description, frequency 
                FROM mistake_patterns 
                WHERE resolved = FALSE 
                ORDER BY frequency DESC 
                LIMIT 5
            `).all()
        };
        return analytics;
    }

    // Get user preferences
    getUserPreferences() {
        return this.db.prepare('SELECT * FROM user_preferences').all();
    }

    // Update user preference
    updateUserPreference(key, value, confidence = 0.5) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO user_preferences 
            (preference_key, preference_value, confidence, last_updated) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        return stmt.run(key, value, confidence);
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = LearningDatabase;
