/**
 * Mobile Analyzer
 * Mobile responsiveness and touch-friendly design analysis
 */

class MobileAnalyzer {
  constructor(config = {}) {
    this.config = {
      minTouchTargetSize: config.minTouchTargetSize || 44,
      maxContentWidth: config.maxContentWidth || 768,
      ...config
    };
  }

  /**
   * Quick mobile responsiveness check
   */
  async quickMobileCheck(page) {
    const mobileResults = await page.evaluate((minTouchSize) => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // Touch target analysis
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      let smallTouchTargets = 0;
      let totalTouchTargets = 0;
      
      interactiveElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        totalTouchTargets++;
        
        if (rect.width < minTouchSize || rect.height < minTouchSize) {
          smallTouchTargets++;
        }
      });
      
      if (smallTouchTargets > 0) {
        results.issues.push({
          type: 'mobile',
          severity: 'medium',
          title: 'Small Touch Targets',
          description: `${smallTouchTargets} of ${totalTouchTargets} interactive elements are too small`,
          impact: 'medium',
          fix: `Ensure touch targets are at least ${minTouchSize}x${minTouchSize}px`,
          count: smallTouchTargets
        });
      }
      
      // Viewport meta tag check
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        results.issues.push({
          type: 'mobile',
          severity: 'high',
          title: 'Missing Viewport Meta Tag',
          description: 'Page lacks responsive viewport configuration',
          impact: 'high',
          fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
        });
      } else {
        const content = viewportMeta.getAttribute('content');
        if (!content.includes('width=device-width')) {
          results.recommendations.push({
            type: 'mobile',
            category: 'viewport',
            title: 'Improve Viewport Configuration',
            description: 'Viewport meta tag could be optimized',
            impact: 'medium',
            suggestion: 'Include width=device-width in viewport meta tag'
          });
        }
      }
      
      // Horizontal scrolling check
      const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
      if (hasHorizontalScroll) {
        results.issues.push({
          type: 'mobile',
          severity: 'medium',
          title: 'Horizontal Scrolling',
          description: 'Content extends beyond viewport width',
          impact: 'medium',
          fix: 'Ensure content fits within viewport width, check for fixed widths'
        });
      }
      
      // Text readability on mobile
      const textElements = document.querySelectorAll('p, span, div, li');
      let unreadableText = 0;
      
      textElements.forEach(el => {
        if (el.textContent.trim()) {
          const style = window.getComputedStyle(el);
          const fontSize = parseInt(style.fontSize);
          
          if (fontSize < 16) {
            unreadableText++;
          }
        }
      });
      
      if (unreadableText > textElements.length * 0.5) {
        results.recommendations.push({
          type: 'mobile',
          category: 'readability',
          title: 'Small Text on Mobile',
          description: `${unreadableText} text elements may be hard to read on mobile`,
          impact: 'medium',
          suggestion: 'Use 16px+ font size for body text on mobile devices'
        });
      }
      
      // Navigation analysis
      const navElements = document.querySelectorAll('nav, .navigation, .menu');
      let mobileUnfriendlyNav = 0;
      
      navElements.forEach(nav => {
        const links = nav.querySelectorAll('a');
        if (links.length > 5) {
          // Check if there's a mobile menu toggle
          const mobileToggle = nav.querySelector('.hamburger, .menu-toggle, [aria-label*="menu"]');
          if (!mobileToggle) {
            mobileUnfriendlyNav++;
          }
        }
      });
      
      if (mobileUnfriendlyNav > 0) {
        results.recommendations.push({
          type: 'mobile',
          category: 'navigation',
          title: 'Mobile Navigation Optimization',
          description: 'Navigation may be difficult to use on mobile',
          impact: 'medium',
          suggestion: 'Consider adding hamburger menu for mobile navigation'
        });
      }
      
      results.metrics.smallTouchTargets = smallTouchTargets;
      results.metrics.totalTouchTargets = totalTouchTargets;
      results.metrics.hasViewportMeta = !!viewportMeta;
      results.metrics.hasHorizontalScroll = hasHorizontalScroll;
      results.metrics.unreadableTextCount = unreadableText;
      
      return results;
    }, this.config.minTouchTargetSize);
    
    return mobileResults;
  }

  /**
   * Comprehensive mobile analysis with device testing
   */
  async responsivenessTest(page) {
    const quickResults = await this.quickMobileCheck(page);
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 }
    ];
    
    const responsiveResults = {
      issues: [],
      recommendations: [],
      metrics: {}
    };
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      const viewportResults = await page.evaluate((vp) => {
        const results = {
          viewport: vp.name,
          issues: [],
          recommendations: []
        };
        
        // Check for content overflow
        const hasOverflow = document.body.scrollWidth > window.innerWidth;
        if (hasOverflow) {
          results.issues.push({
            type: 'mobile',
            severity: 'medium',
            title: `Content Overflow on ${vp.name}`,
            description: 'Content extends beyond viewport',
            impact: 'medium',
            fix: 'Adjust responsive design for this viewport size'
          });
        }
        
        // Check element positioning
        const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const style = window.getComputedStyle(el);
          return style.position === 'fixed';
        });
        
        fixedElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > window.innerWidth || rect.height > window.innerHeight) {
            results.issues.push({
              type: 'mobile',
              severity: 'medium',
              title: `Fixed Element Too Large on ${vp.name}`,
              description: 'Fixed positioned element doesn\'t fit viewport',
              impact: 'medium',
              fix: 'Adjust fixed element sizing for mobile viewports'
            });
          }
        });
        
        // Check form elements on mobile
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          const rect = input.getBoundingClientRect();
          if (rect.width > window.innerWidth * 0.9) {
            results.recommendations.push({
              type: 'mobile',
              category: 'forms',
              title: `Form Element Wide on ${vp.name}`,
              description: 'Form input extends too close to viewport edge',
              impact: 'low',
              suggestion: 'Add margin or max-width to form elements'
            });
          }
        });
        
        return results;
      }, viewport);
      
      responsiveResults.issues.push(...viewportResults.issues);
      responsiveResults.recommendations.push(...viewportResults.recommendations);
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Merge results
    return {
      issues: [...quickResults.issues, ...responsiveResults.issues],
      recommendations: [...quickResults.recommendations, ...responsiveResults.recommendations],
      metrics: { ...quickResults.metrics, ...responsiveResults.metrics }
    };
  }

  /**
   * Full mobile audit with performance testing
   */
  async fullMobileAudit(page) {
    const responsiveResults = await this.responsivenessTest(page);
    
    // Mobile-specific performance checks
    const performanceResults = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // Check for large images
      const images = Array.from(document.images);
      let largeImages = 0;
      
      images.forEach(img => {
        if (img.naturalWidth > 800 || img.naturalHeight > 800) {
          largeImages++;
        }
      });
      
      if (largeImages > 0) {
        results.recommendations.push({
          type: 'mobile',
          category: 'performance',
          title: 'Large Images for Mobile',
          description: `${largeImages} images may be too large for mobile`,
          impact: 'medium',
          suggestion: 'Use responsive images with srcset for mobile optimization'
        });
      }
      
      // Check for mobile-unfriendly content
      const tables = document.querySelectorAll('table');
      if (tables.length > 0) {
        results.recommendations.push({
          type: 'mobile',
          category: 'content',
          title: 'Tables May Need Mobile Optimization',
          description: `${tables.length} tables found - may be hard to use on mobile`,
          impact: 'medium',
          suggestion: 'Consider responsive table design or card layout for mobile'
        });
      }
      
      // Check for hover-dependent interactions
      const hoverElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const styles = window.getComputedStyle(el);
        return styles.cursor === 'pointer' && el.title && !el.onclick;
      });
      
      if (hoverElements.length > 0) {
        results.recommendations.push({
          type: 'mobile',
          category: 'interaction',
          title: 'Hover-Dependent Features',
          description: `${hoverElements.length} elements may rely on hover interactions`,
          impact: 'low',
          suggestion: 'Ensure all functionality is accessible via touch on mobile'
        });
      }
      
      results.metrics.largeImages = largeImages;
      results.metrics.tablesCount = tables.length;
      results.metrics.hoverElements = hoverElements.length;
      
      return results;
    });
    
    // Mobile accessibility checks
    const accessibilityResults = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: []
      };
      
      // Check for zoom blocking
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const content = viewportMeta.getAttribute('content');
        if (content.includes('user-scalable=no') || content.includes('maximum-scale=1')) {
          results.issues.push({
            type: 'mobile',
            severity: 'medium',
            title: 'Zoom Disabled',
            description: 'Viewport prevents user from zooming',
            impact: 'medium',
            fix: 'Remove user-scalable=no and maximum-scale restrictions'
          });
        }
      }
      
      // Check for orientation lock
      const orientationMeta = document.querySelector('meta[name="screen-orientation"]');
      if (orientationMeta) {
        results.recommendations.push({
          type: 'mobile',
          category: 'accessibility',
          title: 'Orientation Lock Detected',
          description: 'Consider if orientation lock is necessary',
          impact: 'low',
          suggestion: 'Allow both portrait and landscape orientations when possible'
        });
      }
      
      return results;
    });
    
    // Merge all results
    return {
      issues: [
        ...responsiveResults.issues, 
        ...performanceResults.issues, 
        ...accessibilityResults.issues
      ],
      recommendations: [
        ...responsiveResults.recommendations, 
        ...performanceResults.recommendations, 
        ...accessibilityResults.recommendations
      ],
      metrics: { 
        ...responsiveResults.metrics, 
        ...performanceResults.metrics 
      }
    };
  }
}

module.exports = MobileAnalyzer;