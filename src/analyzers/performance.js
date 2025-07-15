/**
 * Performance Analyzer
 * Core Web Vitals and performance metrics analysis
 */

class PerformanceAnalyzer {
  constructor(config = {}) {
    this.config = {
      loadTimeThreshold: config.loadTimeThreshold || 3000,
      domSizeThreshold: config.domSizeThreshold || 1500,
      ...config
    };
  }

  /**
   * Quick performance metrics (under 2 seconds)
   */
  async quickMetrics(page) {
    const performanceData = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        results.metrics.loadTime = Math.round(navigation.loadEventEnd - navigation.loadEventStart);
        results.metrics.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        results.metrics.firstPaint = Math.round(navigation.responseEnd - navigation.fetchStart);
      }
      
      // DOM analysis
      const totalElements = document.querySelectorAll('*').length;
      results.metrics.domSize = totalElements;
      
      // Image analysis
      const images = Array.from(document.images);
      const unoptimizedImages = images.filter(img => {
        const src = img.src.toLowerCase();
        return !src.includes('.webp') && !src.includes('.avif') && 
               (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'));
      });
      
      results.metrics.totalImages = images.length;
      results.metrics.unoptimizedImages = unoptimizedImages.length;
      
      // Script analysis
      const scripts = Array.from(document.scripts);
      results.metrics.totalScripts = scripts.length;
      results.metrics.inlineScripts = scripts.filter(s => !s.src).length;
      
      // CSS analysis
      const stylesheets = Array.from(document.styleSheets);
      results.metrics.totalStylesheets = stylesheets.length;
      
      // Performance issues
      if (results.metrics.loadTime > 3000) {
        results.issues.push({
          type: 'performance',
          severity: 'high',
          title: 'Slow Page Load',
          description: `Page took ${results.metrics.loadTime}ms to load`,
          impact: 'high',
          fix: 'Optimize images, reduce JavaScript bundle size, enable compression',
          threshold: '< 3000ms'
        });
      }
      
      if (results.metrics.domSize > 1500) {
        results.issues.push({
          type: 'performance',
          severity: 'medium',
          title: 'Large DOM Size',
          description: `Page has ${results.metrics.domSize} DOM elements`,
          impact: 'medium',
          fix: 'Reduce DOM complexity, consider virtual scrolling for large lists',
          threshold: '< 1500 elements'
        });
      }
      
      if (results.metrics.unoptimizedImages > 0) {
        results.recommendations.push({
          type: 'performance',
          category: 'optimization',
          title: 'Optimize Images',
          description: `${results.metrics.unoptimizedImages} images could be optimized`,
          impact: 'medium',
          suggestion: 'Convert images to WebP or AVIF format for better compression'
        });
      }
      
      if (results.metrics.inlineScripts > 5) {
        results.recommendations.push({
          type: 'performance',
          category: 'optimization',
          title: 'Reduce Inline Scripts',
          description: `${results.metrics.inlineScripts} inline scripts found`,
          impact: 'low',
          suggestion: 'Move inline scripts to external files for better caching'
        });
      }
      
      // Calculate performance score
      let score = 100;
      if (results.metrics.loadTime > 3000) score -= 30;
      else if (results.metrics.loadTime > 2000) score -= 15;
      
      if (results.metrics.domSize > 1500) score -= 20;
      else if (results.metrics.domSize > 1000) score -= 10;
      
      results.metrics.performanceScore = Math.max(0, score);
      
      return results;
    });
    
    return performanceData;
  }

  /**
   * Detailed performance analysis
   */
  async detailedMetrics(page) {
    const quickResults = await this.quickMetrics(page);
    
    // Add Core Web Vitals measurement
    const coreWebVitals = await this.measureCoreWebVitals(page);
    
    // Network analysis
    const networkMetrics = await this.analyzeNetwork(page);
    
    // Resource analysis
    const resourceMetrics = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // Analyze resource loading
      const resources = performance.getEntriesByType('resource');
      
      const slowResources = resources.filter(resource => resource.duration > 1000);
      const largeResources = resources.filter(resource => resource.transferSize > 500000); // 500KB
      
      results.metrics.totalResources = resources.length;
      results.metrics.slowResources = slowResources.length;
      results.metrics.largeResources = largeResources.length;
      
      if (slowResources.length > 0) {
        results.issues.push({
          type: 'performance',
          severity: 'medium',
          title: 'Slow Loading Resources',
          description: `${slowResources.length} resources took over 1 second to load`,
          impact: 'medium',
          fix: 'Optimize slow-loading resources or implement lazy loading'
        });
      }
      
      if (largeResources.length > 0) {
        results.recommendations.push({
          type: 'performance',
          category: 'optimization',
          title: 'Large Resource Files',
          description: `${largeResources.length} resources are larger than 500KB`,
          impact: 'medium',
          suggestion: 'Compress large files or split into smaller chunks'
        });
      }
      
      // Font analysis
      const fontResources = resources.filter(r => 
        r.name.includes('.woff') || r.name.includes('.woff2') || r.name.includes('.ttf')
      );
      
      results.metrics.totalFonts = fontResources.length;
      
      if (fontResources.length > 4) {
        results.recommendations.push({
          type: 'performance',
          category: 'fonts',
          title: 'Too Many Font Files',
          description: `${fontResources.length} font files detected`,
          impact: 'low',
          suggestion: 'Reduce number of font variants or use system fonts'
        });
      }
      
      return results;
    });
    
    // Merge all results
    return {
      issues: [...quickResults.issues, ...coreWebVitals.issues, ...networkMetrics.issues, ...resourceMetrics.issues],
      recommendations: [...quickResults.recommendations, ...coreWebVitals.recommendations, ...networkMetrics.recommendations, ...resourceMetrics.recommendations],
      metrics: { 
        ...quickResults.metrics, 
        ...coreWebVitals.metrics, 
        ...networkMetrics.metrics, 
        ...resourceMetrics.metrics 
      },
      scores: {
        performanceScore: quickResults.metrics.performanceScore,
        coreWebVitalsScore: coreWebVitals.metrics.coreWebVitalsScore
      }
    };
  }

  /**
   * Core Web Vitals measurement
   */
  async measureCoreWebVitals(page) {
    const coreWebVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const results = {
          issues: [],
          recommendations: [],
          metrics: {}
        };
        
        // Largest Contentful Paint (LCP)
        if (window.PerformanceObserver) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            results.metrics.largestContentfulPaint = Math.round(lastEntry.startTime);
            
            if (results.metrics.largestContentfulPaint > 2500) {
              results.issues.push({
                type: 'performance',
                severity: 'high',
                title: 'Poor Largest Contentful Paint',
                description: `LCP is ${results.metrics.largestContentfulPaint}ms`,
                impact: 'high',
                fix: 'Optimize largest content element loading',
                threshold: '< 2500ms'
              });
            }
            
            lcpObserver.disconnect();
          });
          
          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // Fallback if LCP not supported
            results.metrics.largestContentfulPaint = 'Not available';
          }
        }
        
        // First Input Delay (FID) - simulated
        document.addEventListener('click', function measureFID() {
          const fidStart = performance.now();
          requestIdleCallback(() => {
            const fid = performance.now() - fidStart;
            results.metrics.firstInputDelay = Math.round(fid);
            
            if (fid > 100) {
              results.issues.push({
                type: 'performance',
                severity: 'medium',
                title: 'High First Input Delay',
                description: `FID is ${Math.round(fid)}ms`,
                impact: 'medium',
                fix: 'Reduce JavaScript execution time, split long tasks',
                threshold: '< 100ms'
              });
            }
          });
          
          document.removeEventListener('click', measureFID);
        }, { once: true });
        
        // Cumulative Layout Shift (CLS)
        if (window.PerformanceObserver) {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            
            results.metrics.cumulativeLayoutShift = Math.round(clsValue * 1000) / 1000;
            
            if (clsValue > 0.1) {
              results.issues.push({
                type: 'performance',
                severity: 'medium',
                title: 'Layout Shift Issues',
                description: `CLS score is ${results.metrics.cumulativeLayoutShift}`,
                impact: 'medium',
                fix: 'Set dimensions for images and ads, avoid inserting content above existing content',
                threshold: '< 0.1'
              });
            }
          });
          
          try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            results.metrics.cumulativeLayoutShift = 'Not available';
          }
        }
        
        // Calculate Core Web Vitals score
        setTimeout(() => {
          let score = 100;
          if (results.metrics.largestContentfulPaint > 2500) score -= 40;
          if (results.metrics.firstInputDelay > 100) score -= 30;
          if (results.metrics.cumulativeLayoutShift > 0.1) score -= 30;
          
          results.metrics.coreWebVitalsScore = Math.max(0, score);
          resolve(results);
        }, 3000); // Wait for measurements
      });
    });
    
    return coreWebVitals;
  }

  /**
   * Network performance analysis
   */
  async analyzeNetwork(page) {
    const networkData = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // Connection info
      if (navigator.connection) {
        results.metrics.connectionType = navigator.connection.effectiveType;
        results.metrics.downlink = navigator.connection.downlink;
        
        if (navigator.connection.effectiveType === 'slow-2g' || 
            navigator.connection.effectiveType === '2g') {
          results.recommendations.push({
            type: 'performance',
            category: 'network',
            title: 'Slow Network Detected',
            description: 'User is on a slow connection',
            impact: 'high',
            suggestion: 'Implement aggressive optimization for slow networks'
          });
        }
      }
      
      // Service Worker analysis
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          results.metrics.serviceWorkerEnabled = registrations.length > 0;
          
          if (registrations.length === 0) {
            results.recommendations.push({
              type: 'performance',
              category: 'caching',
              title: 'Consider Service Worker',
              description: 'Service Worker could improve performance and offline experience',
              impact: 'low',
              suggestion: 'Implement Service Worker for caching and offline functionality'
            });
          }
        });
      }
      
      return results;
    });
    
    return networkData;
  }

  /**
   * Mobile performance testing
   */
  async mobilePerformanceTest(page) {
    // Throttle network to simulate mobile
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40
    });
    
    // Throttle CPU
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    
    const mobileMetrics = await this.quickMetrics(page);
    
    // Reset throttling
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    
    return {
      ...mobileMetrics,
      metrics: {
        ...mobileMetrics.metrics,
        testCondition: 'mobile-throttled'
      }
    };
  }
}

module.exports = PerformanceAnalyzer;