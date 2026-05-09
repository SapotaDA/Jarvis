const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class NewsService {
    constructor() {
        this.cacheFile = path.join(__dirname, '../../../cache/news_cache.json');
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.newsSources = {
            general: [
                {
                    name: 'NewsAPI',
                    url: 'https://newsapi.org/v2/top-headlines',
                    apiKey: process.env.NEWS_API_KEY,
                    country: 'us',
                    category: 'general'
                },
                {
                    name: 'BBC News',
                    url: 'https://newsapi.org/v2/top-headlines',
                    apiKey: process.env.NEWS_API_KEY,
                    sources: 'bbc-news'
                },
                {
                    name: 'CNN',
                    url: 'https://newsapi.org/v2/top-headlines',
                    apiKey: process.env.NEWS_API_KEY,
                    sources: 'cnn'
                }
            ],
            technology: [
                {
                    name: 'TechCrunch',
                    url: 'https://newsapi.org/v2/top-headlines',
                    apiKey: process.env.NEWS_API_KEY,
                    sources: 'techcrunch'
                },
                {
                    name: 'Hacker News',
                    url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
                    apiKey: null,
                    custom: true
                }
            ],
            business: [
                {
                    name: 'Business News',
                    url: 'https://newsapi.org/v2/top-headlines',
                    apiKey: process.env.NEWS_API_KEY,
                    category: 'business'
                },
                {
                    name: 'Wall Street Journal',
                    url: 'https://newsapi.org/v2/top-headlines',
                    apiKey: process.env.NEWS_API_KEY,
                    sources: 'the-wall-street-journal'
                }
            ],
            science: [
                {
                    name: 'Science News',
                    url: 'https://newsapi.org/v2/top-headlines',
                    apiKey: process.env.NEWS_API_KEY,
                    category: 'science'
                }
            ],
            sports: [
                {
                    name: 'ESPN',
                    url: 'https://newsapi.org/v2/top-headlines',
                    apiKey: process.env.NEWS_API_KEY,
                    sources: 'espn'
                }
            ]
        };
        
        this.initializeCache();
    }

    async initializeCache() {
        try {
            const cacheData = await fs.readFile(this.cacheFile, 'utf8');
            const parsed = JSON.parse(cacheData);
            
            // Check if cache is still valid
            const now = Date.now();
            for (const [key, value] of Object.entries(parsed)) {
                if (now - value.timestamp < this.cacheTimeout) {
                    this.cache.set(key, value);
                }
            }
        } catch (error) {
            // Cache file doesn't exist or is invalid, start fresh
            console.log('News cache initialized fresh');
        }
    }

    async saveCache() {
        try {
            const cacheData = {};
            for (const [key, value] of this.cache.entries()) {
                cacheData[key] = value;
            }
            
            await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
        } catch (error) {
            console.error('Failed to save news cache:', error);
        }
    }

    async getTopHeadlines(category = 'general', limit = 10) {
        const cacheKey = `headlines_${category}_${limit}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const sources = this.newsSources[category] || this.newsSources.general;
            const articles = [];

            for (const source of sources) {
                try {
                    const news = await this.fetchFromSource(source, limit);
                    if (news && news.articles) {
                        articles.push(...news.articles);
                    }
                } catch (error) {
                    console.warn(`Failed to fetch from ${source.name}:`, error.message);
                }
            }

            // Remove duplicates and limit results
            const uniqueArticles = this.removeDuplicates(articles).slice(0, limit);
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: uniqueArticles,
                timestamp: Date.now()
            });
            
            await this.saveCache();
            
            return uniqueArticles;
        } catch (error) {
            console.error('Failed to fetch news:', error);
            return this.getFallbackNews();
        }
    }

    async fetchFromSource(source, limit = 10) {
        if (source.custom) {
            return this.fetchCustomSource(source, limit);
        }

        if (!source.apiKey) {
            throw new Error('No API key provided for news source');
        }

        const params = new URLSearchParams({
            apiKey: source.apiKey,
            pageSize: limit.toString()
        });

        if (source.country) params.append('country', source.country);
        if (source.category) params.append('category', source.category);
        if (source.sources) params.append('sources', source.sources);

        const url = `${source.url}?${params.toString()}`;
        
        return new Promise((resolve, reject) => {
            const protocol = source.url.startsWith('https') ? https : http;
            const request = protocol.get(url, { timeout: 10000 }, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async fetchCustomSource(source, limit = 10) {
        if (source.name === 'Hacker News') {
            return this.fetchHackerNews(limit);
        }
        
        throw new Error(`Unknown custom source: ${source.name}`);
    }

    async fetchHackerNews(limit = 10) {
        try {
            // Get top story IDs
            const storiesResponse = await this.fetchJson('https://hacker-news.firebaseio.com/v0/topstories.json');
            const storyIds = storiesResponse.slice(0, limit);

            const articles = [];
            for (const storyId of storyIds) {
                try {
                    const story = await this.fetchJson(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
                    
                    if (story && story.title && story.url) {
                        articles.push({
                            title: story.title,
                            description: story.text || '',
                            url: story.url,
                            source: 'Hacker News',
                            publishedAt: new Date(story.time * 1000).toISOString(),
                            author: story.by
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to fetch Hacker News story ${storyId}:`, error.message);
                }
            }

            return { articles };
        } catch (error) {
            console.error('Failed to fetch Hacker News:', error);
            throw error;
        }
    }

    async fetchJson(url) {
        return new Promise((resolve, reject) => {
            https.get(url, { timeout: 10000 }, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject).on('timeout', () => {
                    reject(new Error('Request timeout'));
                });
        });
    }

    removeDuplicates(articles) {
        const seen = new Set();
        return articles.filter(article => {
            const key = `${article.title}-${article.url}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    getFallbackNews() {
        return [
            {
                title: 'JARVIS News Service',
                description: 'Unable to fetch latest news. Please check your internet connection.',
                url: '#',
                source: 'JARVIS',
                publishedAt: new Date().toISOString(),
                author: 'JARVIS System'
            }
        ];
    }

    async searchNews(query, category = 'general', limit = 10) {
        const cacheKey = `search_${category}_${query}_${limit}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            if (!process.env.NEWS_API_KEY) {
                return this.getFallbackSearchResults(query);
            }

            const params = {
                apiKey: process.env.NEWS_API_KEY,
                q: query,
                pageSize: limit,
                sortBy: 'relevancy',
                language: 'en'
            };

            if (category !== 'general') {
                params.category = category;
            }

            const response = await axios.get('https://newsapi.org/v2/everything', {
                params,
                timeout: 10000
            });

            const articles = response.data.articles || [];
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: articles,
                timestamp: Date.now()
            });
            
            await this.saveCache();
            
            return articles;
        } catch (error) {
            console.error('Failed to search news:', error);
            return this.getFallbackSearchResults(query);
        }
    }

    getFallbackSearchResults(query) {
        return [
            {
                title: `Search Results for "${query}"`,
                description: 'Unable to fetch search results. Please check your internet connection and API configuration.',
                url: '#',
                source: 'JARVIS',
                publishedAt: new Date().toISOString(),
                author: 'JARVIS System'
            }
        ];
    }

    async getNewsSummary(category = 'general') {
        try {
            const headlines = await this.getTopHeadlines(category, 5);
            
            if (headlines.length === 0) {
                return "I'm unable to fetch the latest news at the moment, Sir. Please check your internet connection.";
            }

            const summary = headlines.map(article => 
                `• ${article.title} (${article.source})`
            ).join('\n');

            return `Here are the latest ${category} headlines:\n\n${summary}`;
        } catch (error) {
            return "I apologize, Sir. I'm having trouble accessing the news service at the moment.";
        }
    }

    async getBreakingNews() {
        try {
            const headlines = await this.getTopHeadlines('general', 3);
            
            if (headlines.length === 0) {
                return "No breaking news available at the moment, Sir.";
            }

            const breaking = headlines[0];
            return `🚨 BREAKING: ${breaking.title}\n\n${breaking.description || 'Read more for details.'}\n\nSource: ${breaking.source}`;
        } catch (error) {
            return "I apologize, Sir. I'm unable to fetch breaking news at the moment.";
        }
    }

    async getNewsByTopic(topic) {
        try {
            const results = await this.searchNews(topic, 'general', 5);
            
            if (results.length === 0) {
                return `I couldn't find any news about "${topic}", Sir.`;
            }

            const summary = results.map(article => 
                `• ${article.title} (${article.source})`
            ).join('\n');

            return `Here are the latest news about "${topic}":\n\n${summary}`;
        } catch (error) {
            return `I apologize, Sir. I'm having trouble finding news about "${topic}" at the moment.`;
        }
    }

    async getTechNews() {
        return await this.getNewsSummary('technology');
    }

    async getBusinessNews() {
        return await this.getNewsSummary('business');
    }

    async getScienceNews() {
        return await this.getNewsSummary('science');
    }

    async getSportsNews() {
        return await this.getNewsSummary('sports');
    }

    // News categories helper
    getAvailableCategories() {
        return Object.keys(this.newsSources);
    }

    // Cache management
    clearCache() {
        this.cache.clear();
        return { success: true, message: 'News cache cleared' };
    }

    getCacheStatus() {
        return {
            cacheSize: this.cache.size,
            cacheTimeout: this.cacheTimeout,
            availableSources: Object.keys(this.newsSources)
        };
    }
}

module.exports = new NewsService();
