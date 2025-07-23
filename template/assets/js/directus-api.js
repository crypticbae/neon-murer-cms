/**
 * Neon Murer - Directus API Client
 * Handles all communication with Directus CMS
 * Features: Caching, Error Handling, Fallbacks, Performance Monitoring
 * 
 * @version 1.0.0
 * @author Neon Murer Development Team
 */

class NeonMurerAPI {
  constructor(config = {}) {
    // Configuration
    this.baseURL = config.baseURL || 'http://localhost:8055';
    this.adminToken = config.adminToken || null;
    this.timeout = config.timeout || 10000; // 10 seconds
    
    // Cache system
    this.cache = new Map();
    this.cacheTimeout = config.cacheTimeout || 5 * 60 * 1000; // 5 minutes
    
    // Performance monitoring
    this.performanceLog = [];
    this.enableLogging = config.enableLogging || false;
    
    // Retry configuration
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
    
    console.log('🚀 Neon Murer API Client initialized:', {
      baseURL: this.baseURL,
      cacheTimeout: this.cacheTimeout,
      enableLogging: this.enableLogging
    });
  }

  /**
   * Core fetch method with error handling, caching, and retries
   */
  async fetchData(endpoint, options = {}) {
    const {
      useCache = true,
      useAuth = false,
      retries = this.maxRetries,
      timeout = this.timeout
    } = options;

    const cacheKey = endpoint;
    const startTime = performance.now();

    // Cache check
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        this.logPerformance(endpoint, performance.now() - startTime, 'cache');
        return cached.data;
      }
    }

    // Prepare request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (useAuth && this.adminToken) {
      headers['Authorization'] = `Bearer ${this.adminToken}`;
    }

    const requestOptions = {
      method: 'GET',
      headers,
      signal: controller.signal,
      ...options.fetchOptions
    };

    try {
      const response = await fetch(`${this.baseURL}/items/${endpoint}`, requestOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache successful response
      if (useCache) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
      }
      
      this.logPerformance(endpoint, performance.now() - startTime, 'api');
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry logic
      if (retries > 0 && !controller.signal.aborted) {
        console.warn(`⚠️ API retry for ${endpoint}, attempts left: ${retries - 1}`);
        await this.delay(this.retryDelay);
        return this.fetchData(endpoint, { ...options, retries: retries - 1 });
      }
      
      console.error('❌ API Error:', error);
      this.logPerformance(endpoint, performance.now() - startTime, 'error');
      return this.getFallbackData(endpoint);
    }
  }

  /**
   * Team Members API
   */
  async getTeamMembers(filters = {}) {
    const query = this.buildQuery({
      filter: { 
        status: { _eq: 'active' },
        ...filters 
      },
      sort: ['sort_order', 'name'],
      fields: ['*']
    });
    
    const data = await this.fetchData(`team_members${query}`);
    return this.processTeamMembers(data?.data || []);
  }

  /**
   * Service Categories API
   */
  async getServiceCategories(filters = {}) {
    const query = this.buildQuery({
      filter: { 
        status: { _eq: 'published' },
        ...filters 
      },
      sort: ['sort_order', 'title'],
      fields: ['*', 'hero_image.*']
    });
    
    const data = await this.fetchData(`service_categories${query}`);
    return this.processServiceCategories(data?.data || []);
  }

  /**
   * Service Items API
   */
  async getServiceItems(categoryId = null) {
    const filters = categoryId ? { category_id: { _eq: categoryId } } : {};
    
    const query = this.buildQuery({
      filter: { 
        status: { _eq: 'published' },
        ...filters 
      },
      sort: ['sort_order', 'title'],
      fields: ['*', 'images.*', 'category_id.title', 'category_id.slug']
    });
    
    const data = await this.fetchData(`service_items${query}`);
    return this.processServiceItems(data?.data || []);
  }

  /**
   * Client Logos API
   */
  async getClientLogos(filters = {}) {
    const query = this.buildQuery({
      filter: { 
        status: { _eq: 'active' },
        ...filters 
      },
      sort: ['sort_order', 'company_name'],
      fields: ['*', 'logo_file.*']
    });
    
    const data = await this.fetchData(`client_logos${query}`);
    return this.processClientLogos(data?.data || []);
  }

  /**
   * News Articles API
   */
  async getNews(limit = 10, offset = 0) {
    const query = this.buildQuery({
      filter: { status: { _eq: 'published' } },
      sort: ['-published_date'],
      limit,
      offset,
      fields: ['*', 'author.name', 'author.image.*', 'featured_image.*']
    });
    
    const data = await this.fetchData(`news_articles${query}`);
    return this.processNews(data?.data || []);
  }

  /**
   * Site Settings API
   */
  async getSiteSettings(key = null) {
    const filters = key ? { key: { _eq: key } } : {};
    const query = this.buildQuery({
      filter: filters,
      fields: ['*']
    });
    
    const data = await this.fetchData(`site_settings${query}`);
    return this.processSiteSettings(data?.data || [], key);
  }

  /**
   * Build Directus query string
   */
  buildQuery(params) {
    const query = new URLSearchParams();
    
    if (params.filter) {
      query.append('filter', JSON.stringify(params.filter));
    }
    
    if (params.sort) {
      query.append('sort', Array.isArray(params.sort) ? params.sort.join(',') : params.sort);
    }
    
    if (params.fields) {
      query.append('fields', Array.isArray(params.fields) ? params.fields.join(',') : params.fields);
    }
    
    if (params.limit) {
      query.append('limit', params.limit);
    }
    
    if (params.offset) {
      query.append('offset', params.offset);
    }
    
    return query.toString() ? `?${query.toString()}` : '';
  }

  /**
   * Data processing methods
   */
  processTeamMembers(data) {
    return data.map(member => ({
      ...member,
      imageUrl: this.getAssetUrl(member.image),
      phoneFormatted: this.formatPhone(member.phone),
      emailObfuscated: this.obfuscateEmail(member.email)
    }));
  }

  processServiceCategories(data) {
    return data.map(category => ({
      ...category,
      heroImageUrl: this.getAssetUrl(category.hero_image),
      url: this.buildServiceUrl(category.slug)
    }));
  }

  processServiceItems(data) {
    return data.map(item => ({
      ...item,
      imageUrls: this.getMultipleAssetUrls(item.images),
      categoryTitle: item.category_id?.title,
      categorySlug: item.category_id?.slug,
      url: this.buildServiceItemUrl(item.category_id?.slug, item.slug)
    }));
  }

  processClientLogos(data) {
    return data.map(client => ({
      ...client,
      logoUrl: this.getAssetUrl(client.logo_file),
      hasWebsite: !!client.website_url
    }));
  }

  processNews(data) {
    return data.map(article => ({
      ...article,
      featuredImageUrl: this.getAssetUrl(article.featured_image),
      authorImageUrl: this.getAssetUrl(article.author?.image),
      publishedDateFormatted: this.formatDate(article.published_date),
      url: this.buildNewsUrl(article.slug)
    }));
  }

  processSiteSettings(data, key) {
    if (key) {
      const setting = data.find(item => item.key === key);
      return setting ? this.parseSiteSettingValue(setting) : null;
    }
    
    const settings = {};
    data.forEach(item => {
      settings[item.key] = this.parseSiteSettingValue(item);
    });
    return settings;
  }

  /**
   * Utility methods
   */
  getAssetUrl(asset, size = null) {
    if (!asset || !asset.id) return null;
    
    const baseUrl = `${this.baseURL}/assets/${asset.id}`;
    return size ? `${baseUrl}?width=${size}&height=${size}&fit=cover` : baseUrl;
  }

  getMultipleAssetUrls(assets, size = null) {
    if (!Array.isArray(assets)) return [];
    return assets.map(asset => this.getAssetUrl(asset, size)).filter(Boolean);
  }

  formatPhone(phone) {
    if (!phone) return '';
    // Swiss phone number formatting
    return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '+41 $1 $2 $3 $4');
  }

  obfuscateEmail(email) {
    if (!email) return '';
    const [user, domain] = email.split('@');
    return `${user.substring(0, 2)}***@${domain}`;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  buildServiceUrl(slug) {
    return `/${slug}.html`;
  }

  buildServiceItemUrl(categorySlug, itemSlug) {
    return `/${categorySlug}/${itemSlug}.html`;
  }

  buildNewsUrl(slug) {
    return `/news/${slug}.html`;
  }

  parseSiteSettingValue(setting) {
    if (setting.type === 'json') {
      try {
        return JSON.parse(setting.value);
      } catch (e) {
        console.warn('Failed to parse JSON setting:', setting.key);
        return setting.value;
      }
    }
    return setting.value;
  }

  /**
   * Fallback data for offline scenarios
   */
  getFallbackData(endpoint) {
    console.log('📦 Using fallback data for:', endpoint);
    
    const fallbacks = {
      'team_members': [
        {
          id: 1,
          name: "Benno Murer",
          position: "VR-Vorsitz, Geschäftsführung, Beratung und Verkauf",
          location: "Uznach",
          email: "benno.murer@neonmurer.ch",
          phone: "055 225 50 25",
          imageUrl: "content/images/person1.jpg",
          status: "active"
        },
        {
          id: 2,
          name: "Andreas Zybach", 
          position: "Produktionsleiter, Beratung und Verkauf",
          location: "Uznach",
          email: "andreas.zybach@neonmurer.ch",
          phone: "055 225 50 25",
          imageUrl: "content/images/person2.jpg",
          status: "active"
        }
      ],
      'client_logos': [
        { id: 1, company_name: "McDonald's", logoUrl: "content/images/McDonalds.png", status: "active" },
        { id: 2, company_name: "Lindt", logoUrl: "content/images/Lindt.png", status: "active" },
        { id: 3, company_name: "Baloise", logoUrl: "content/images/Baloise.svg", status: "active" }
      ],
      'service_categories': [
        {
          id: 1,
          title: "Lichtwerbung",
          description: "Professionelle Leuchtschriften und LED-Technik",
          slug: "lichtwerbung",
          heroImageUrl: "content/images/546aa65af854dcf4936912fbbde4dfd2.jpg",
          status: "published"
        }
      ]
    };
    
    const baseEndpoint = endpoint.split('?')[0];
    return { data: fallbacks[baseEndpoint] || [] };
  }

  /**
   * Performance monitoring
   */
  logPerformance(endpoint, duration, source) {
    if (!this.enableLogging) return;
    
    const logEntry = {
      endpoint,
      duration: Math.round(duration),
      source,
      timestamp: new Date().toISOString()
    };
    
    this.performanceLog.push(logEntry);
    
    // Keep only last 100 entries
    if (this.performanceLog.length > 100) {
      this.performanceLog.shift();
    }
    
    console.log(`⚡ API Performance: ${endpoint} (${source}) - ${logEntry.duration}ms`);
  }

  getPerformanceReport() {
    if (this.performanceLog.length === 0) return null;
    
    const total = this.performanceLog.length;
    const avgDuration = this.performanceLog.reduce((sum, log) => sum + log.duration, 0) / total;
    const cacheHitRate = this.performanceLog.filter(log => log.source === 'cache').length / total;
    
    return {
      totalRequests: total,
      averageDuration: Math.round(avgDuration),
      cacheHitRate: Math.round(cacheHitRate * 100),
      recentEntries: this.performanceLog.slice(-10)
    };
  }

  /**
   * Utility helper methods
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ API cache cleared');
  }

  updateConfig(newConfig) {
    Object.assign(this, newConfig);
    console.log('⚙️ API configuration updated:', newConfig);
  }
}

// Global instance with environment detection
const apiConfig = {
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8055' 
    : 'https://api.neonmurer.ch',
  enableLogging: window.location.hostname === 'localhost',
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
};

window.neonAPI = new NeonMurerAPI(apiConfig);

// Development helpers
if (window.location.hostname === 'localhost') {
  window.neonAPI.dev = {
    getCache: () => window.neonAPI.cache,
    getPerformance: () => window.neonAPI.getPerformanceReport(),
    clearCache: () => window.neonAPI.clearCache(),
    testEndpoint: (endpoint) => window.neonAPI.fetchData(endpoint)
  };
}

console.log('✅ Neon Murer API Client ready!'); 