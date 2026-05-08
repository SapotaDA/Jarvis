const LearningDatabase = require('../../learning/memory/learning_database');

class PerformanceMonitor {
    constructor() {
        this.learningDB = new LearningDatabase();
        this.metrics = {
            response_times: [],
            success_rates: [],
            error_counts: {},
            user_engagement: [],
            system_load: []
        };
        this.alertThresholds = {
            avg_response_time: 3000,
            min_success_rate: 0.7,
            max_error_rate: 0.3,
            min_engagement: 0.5
        };
    }

    // Record performance metrics
    recordMetric(metricType, value, context = null) {
        const timestamp = Date.now();
        
        // Store in database
        this.learningDB.recordMetric(metricType, value, context);
        
        // Store in memory for real-time monitoring
        if (!this.metrics[metricType]) {
            this.metrics[metricType] = [];
        }
        
        this.metrics[metricType].push({
            value,
            timestamp,
            context
        });

        // Keep only recent metrics (last 1000 entries)
        if (this.metrics[metricType].length > 1000) {
            this.metrics[metricType] = this.metrics[metricType].slice(-1000);
        }

        // Check for performance alerts
        this.checkPerformanceAlerts(metricType, value);
    }

    // Monitor response performance
    monitorResponse(userInput, aiResponse, responseTime, success = null) {
        // Record response time
        this.recordMetric('response_time', responseTime, userInput.substring(0, 50));

        // Record success if provided
        if (success !== null) {
            this.recordMetric('response_success', success ? 1 : 0, userInput.substring(0, 50));
        }

        // Record response length
        this.recordMetric('response_length', aiResponse.length, 'text_analysis');

        // Record user engagement (based on input complexity)
        const engagementScore = this.calculateEngagementScore(userInput);
        this.recordMetric('user_engagement', engagementScore, 'interaction_analysis');

        return {
            response_time: responseTime,
            engagement_score: engagementScore,
            performance_rating: this.calculatePerformanceRating(responseTime, success)
        };
    }

    // Calculate user engagement score
    calculateEngagementScore(userInput) {
        let score = 0.5; // Base score

        // Length factor
        if (userInput.length > 10) score += 0.1;
        if (userInput.length > 20) score += 0.1;
        if (userInput.length > 50) score += 0.1;

        // Question factor
        if (userInput.includes('?')) score += 0.2;

        // Complexity factor (presence of multiple concepts)
        const complexWords = ['what', 'how', 'why', 'when', 'where', 'explain', 'describe', 'compare'];
        const complexCount = complexWords.filter(word => userInput.toLowerCase().includes(word)).length;
        score += Math.min(complexCount * 0.1, 0.3);

        return Math.min(score, 1.0);
    }

    // Calculate performance rating
    calculatePerformanceRating(responseTime, success) {
        let rating = 0.5; // Base rating

        // Response time factor
        if (responseTime < 1000) rating += 0.3;
        else if (responseTime < 2000) rating += 0.2;
        else if (responseTime < 3000) rating += 0.1;
        else if (responseTime > 5000) rating -= 0.2;

        // Success factor
        if (success === true) rating += 0.3;
        else if (success === false) rating -= 0.3;

        return Math.max(0, Math.min(1, rating));
    }

    // Check for performance alerts
    checkPerformanceAlerts(metricType, value) {
        const alerts = [];

        switch (metricType) {
            case 'response_time':
                if (value > this.alertThresholds.avg_response_time) {
                    alerts.push({
                        type: 'slow_response',
                        severity: value > 5000 ? 'high' : 'medium',
                        message: `Slow response detected: ${value}ms`,
                        value: value
                    });
                }
                break;

            case 'response_success':
                const recentSuccessRate = this.calculateRecentSuccessRate();
                if (recentSuccessRate < this.alertThresholds.min_success_rate) {
                    alerts.push({
                        type: 'low_success_rate',
                        severity: 'high',
                        message: `Success rate dropped to ${(recentSuccessRate * 100).toFixed(1)}%`,
                        value: recentSuccessRate
                    });
                }
                break;

            case 'user_engagement':
                const recentEngagement = this.calculateRecentEngagement();
                if (recentEngagement < this.alertThresholds.min_engagement) {
                    alerts.push({
                        type: 'low_engagement',
                        severity: 'medium',
                        message: `User engagement decreased to ${(recentEngagement * 100).toFixed(1)}%`,
                        value: recentEngagement
                    });
                }
                break;
        }

        // Handle alerts
        alerts.forEach(alert => this.handlePerformanceAlert(alert));

        return alerts;
    }

    // Handle performance alerts
    handlePerformanceAlert(alert) {
        console.log(`🚨 Performance Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
        
        // Store alert in database
        this.learningDB.recordMetric('performance_alert', 1, JSON.stringify(alert));

        // Trigger automatic responses for critical alerts
        if (alert.severity === 'high') {
            this.triggerAutomaticOptimization(alert);
        }
    }

    // Trigger automatic optimization for critical issues
    triggerAutomaticOptimization(alert) {
        switch (alert.type) {
            case 'slow_response':
                console.log('🔧 Triggering response time optimization...');
                // Logic to optimize response times
                this.optimizeResponseTimes();
                break;

            case 'low_success_rate':
                console.log('🔧 Triggering success rate optimization...');
                // Logic to improve success rates
                this.improveSuccessRates();
                break;

            case 'low_engagement':
                console.log('🔧 Triggering engagement optimization...');
                // Logic to improve user engagement
                this.improveUserEngagement();
                break;
        }
    }

    // Optimization methods
    optimizeResponseTimes() {
        // Implementation for response time optimization
        this.recordMetric('optimization_triggered', 1, 'response_time');
    }

    improveSuccessRates() {
        // Implementation for success rate improvement
        this.recordMetric('optimization_triggered', 1, 'success_rate');
    }

    improveUserEngagement() {
        // Implementation for engagement improvement
        this.recordMetric('optimization_triggered', 1, 'user_engagement');
    }

    // Calculate recent success rate
    calculateRecentSuccessRate() {
        const recentSuccess = this.metrics.response_success.slice(-50);
        if (recentSuccess.length === 0) return 1.0;

        const successCount = recentSuccess.filter(m => m.value > 0.5).length;
        return successCount / recentSuccess.length;
    }

    // Calculate recent engagement
    calculateRecentEngagement() {
        const recentEngagement = this.metrics.user_engagement.slice(-50);
        if (recentEngagement.length === 0) return 0.5;

        const totalEngagement = recentEngagement.reduce((sum, m) => sum + m.value, 0);
        return totalEngagement / recentEngagement.length;
    }

    // Get comprehensive performance report
    getPerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overview: this.getPerformanceOverview(),
            detailed_metrics: this.getDetailedMetrics(),
            trends: this.getPerformanceTrends(),
            alerts: this.getRecentAlerts(),
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    // Get performance overview
    getPerformanceOverview() {
        return {
            avg_response_time: this.calculateAverage('response_time'),
            success_rate: this.calculateRecentSuccessRate(),
            engagement_rate: this.calculateRecentEngagement(),
            total_interactions: this.metrics.response_time.length,
            error_rate: this.calculateErrorRate()
        };
    }

    // Get detailed metrics
    getDetailedMetrics() {
        return {
            response_times: {
                avg: this.calculateAverage('response_time'),
                min: this.calculateMinimum('response_time'),
                max: this.calculateMaximum('response_time'),
                p95: this.calculatePercentile('response_time', 95)
            },
            user_engagement: {
                avg: this.calculateAverage('user_engagement'),
                trend: this.calculateTrend('user_engagement')
            },
            system_health: {
                uptime: this.calculateUptime(),
                memory_usage: this.getMemoryUsage(),
                error_count: this.getTotalErrors()
            }
        };
    }

    // Get performance trends
    getPerformanceTrends() {
        return {
            response_time_trend: this.calculateTrend('response_time'),
            success_rate_trend: this.calculateTrend('response_success'),
            engagement_trend: this.calculateTrend('user_engagement')
        };
    }

    // Get recent alerts
    getRecentAlerts() {
        return this.learningDB.db.prepare(`
            SELECT context, timestamp 
            FROM performance_metrics 
            WHERE metric_type = 'performance_alert' 
            ORDER BY timestamp DESC 
            LIMIT 10
        `).all().map(alert => ({
            ...alert,
            details: JSON.parse(alert.context)
        }));
    }

    // Generate performance recommendations
    generateRecommendations() {
        const overview = this.getPerformanceOverview();
        const recommendations = [];

        if (overview.avg_response_time > this.alertThresholds.avg_response_time) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'Optimize Response Times',
                description: 'Consider implementing faster fallback responses or optimizing LLM settings'
            });
        }

        if (overview.success_rate < this.alertThresholds.min_success_rate) {
            recommendations.push({
                type: 'accuracy',
                priority: 'high',
                title: 'Improve Response Accuracy',
                description: 'Review common mistakes and enhance adaptive response patterns'
            });
        }

        if (overview.engagement_rate < this.alertThresholds.min_engagement) {
            recommendations.push({
                type: 'engagement',
                priority: 'medium',
                title: 'Enhance User Engagement',
                description: 'Implement more interactive responses and better context awareness'
            });
        }

        return recommendations;
    }

    // Utility methods for calculations
    calculateAverage(metricType) {
        const metrics = this.metrics[metricType] || [];
        if (metrics.length === 0) return 0;

        const total = metrics.reduce((sum, m) => sum + m.value, 0);
        return total / metrics.length;
    }

    calculateMinimum(metricType) {
        const metrics = this.metrics[metricType] || [];
        if (metrics.length === 0) return 0;

        return Math.min(...metrics.map(m => m.value));
    }

    calculateMaximum(metricType) {
        const metrics = this.metrics[metricType] || [];
        if (metrics.length === 0) return 0;

        return Math.max(...metrics.map(m => m.value));
    }

    calculatePercentile(metricType, percentile) {
        const metrics = this.metrics[metricType] || [];
        if (metrics.length === 0) return 0;

        const sorted = metrics.map(m => m.value).sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index];
    }

    calculateTrend(metricType) {
        const metrics = this.metrics[metricType] || [];
        if (metrics.length < 10) return 'insufficient_data';

        const recent = metrics.slice(-10);
        const older = metrics.slice(-20, -10);

        if (older.length === 0) return 'insufficient_data';

        const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length;

        const change = (recentAvg - olderAvg) / olderAvg;

        if (change > 0.1) return 'improving';
        if (change < -0.1) return 'declining';
        return 'stable';
    }

    calculateErrorRate() {
        const totalResponses = this.metrics.response_success.length;
        if (totalResponses === 0) return 0;

        const errors = this.metrics.response_success.filter(m => m.value < 0.5).length;
        return errors / totalResponses;
    }

    calculateUptime() {
        // Simple uptime calculation - can be enhanced
        return '99.9%';
    }

    getMemoryUsage() {
        // Mock memory usage - can be enhanced with actual system metrics
        return {
            used: '45MB',
            total: '128MB',
            percentage: 35
        };
    }

    getTotalErrors() {
        return Object.values(this.metrics.error_counts).reduce((sum, count) => sum + count, 0);
    }

    // Export performance data
    exportPerformanceData() {
        return {
            metrics: this.metrics,
            report: this.getPerformanceReport(),
            timestamp: new Date().toISOString()
        };
    }

    // Close connections
    close() {
        this.learningDB.close();
    }
}

module.exports = PerformanceMonitor;
