/**
 * Accessibility Analyzer
 * WCAG 2.1 compliance checking and accessibility issue detection
 */

class AccessibilityAnalyzer {
  constructor(config = {}) {
    this.config = {
      level: config.level || 'AA', // AA or AAA
      includeWarnings: config.includeWarnings || true,
      ...config
    };
  }

  /**
   * Quick accessibility check (under 2 seconds)
   */
  async quickCheck(page) {
    const issues = [];
    const recommendations = [];
    
    const quickAccessibilityChecks = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // 1. Missing alt text on images
      const imagesWithoutAlt = Array.from(document.images).filter(img => 
        !img.alt || img.alt.trim() === ''
      );
      if (imagesWithoutAlt.length > 0) {
        results.issues.push({
          type: 'accessibility',
          severity: 'high',
          title: 'Missing Alt Text',
          description: `${imagesWithoutAlt.length} images missing alt attributes`,
          impact: 'high',
          fix: 'Add descriptive alt text to all images for screen readers',
          wcag: '1.1.1',
          count: imagesWithoutAlt.length
        });
      }
      
      // 2. Form inputs without labels
      const unlabeledInputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(input => {
        if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') {
          return false;
        }
        
        const hasLabel = document.querySelector(`label[for="${input.id}"]`) ||
                        input.closest('label') ||
                        input.getAttribute('aria-label') ||
                        input.getAttribute('aria-labelledby') ||
                        input.getAttribute('title');
        return !hasLabel;
      });
      
      if (unlabeledInputs.length > 0) {
        results.issues.push({
          type: 'accessibility',
          severity: 'critical',
          title: 'Unlabeled Form Controls',
          description: `${unlabeledInputs.length} form controls lack proper labels`,
          impact: 'high',
          fix: 'Add labels, aria-label, or aria-labelledby attributes to all form controls',
          wcag: '1.3.1, 3.3.2',
          count: unlabeledInputs.length
        });
      }
      
      // 3. Missing page title
      const pageTitle = document.title;
      if (!pageTitle || pageTitle.trim() === '') {
        results.issues.push({
          type: 'accessibility',
          severity: 'medium',
          title: 'Missing Page Title',
          description: 'Page lacks a descriptive title',
          impact: 'medium',
          fix: 'Add a descriptive title element to the page head',
          wcag: '2.4.2'
        });
      }
      
      // 4. Missing main landmark
      const mainLandmark = document.querySelector('main, [role="main"]');
      if (!mainLandmark) {
        results.recommendations.push({
          type: 'accessibility',
          category: 'structure',
          title: 'Add Main Landmark',
          description: 'Page would benefit from a main landmark for navigation',
          impact: 'medium',
          suggestion: 'Add <main> element or role="main" to identify primary content',
          wcag: '1.3.1'
        });
      }
      
      // 5. Link text quality
      const poorLinks = Array.from(document.links).filter(link => {
        const text = link.textContent.trim().toLowerCase();
        return text === 'click here' || text === 'read more' || text === 'more' || text === 'here';
      });
      
      if (poorLinks.length > 0) {
        results.recommendations.push({
          type: 'accessibility',
          category: 'navigation',
          title: 'Improve Link Text',
          description: `${poorLinks.length} links have non-descriptive text`,
          impact: 'medium',
          suggestion: 'Use descriptive link text that explains the destination or purpose',
          wcag: '2.4.4'
        });
      }
      
      // Metrics
      results.metrics.accessibilityQuickScore = Math.max(0, 100 - (results.issues.length * 15));
      results.metrics.totalFormControls = document.querySelectorAll('input, select, textarea').length;
      results.metrics.totalImages = document.images.length;
      results.metrics.totalLinks = document.links.length;
      
      return results;
    });
    
    return quickAccessibilityChecks;
  }

  /**
   * Full accessibility audit (comprehensive)
   */
  async fullAudit(page) {
    const quickResults = await this.quickCheck(page);
    
    // Add comprehensive checks
    const comprehensiveChecks = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {},
        scores: {}
      };
      
      // Color contrast analysis (simplified)
      const contrastIssues = [];
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a');
      
      textElements.forEach((element, index) => {
        if (element.textContent.trim() && index < 50) { // Limit for performance
          const styles = window.getComputedStyle(element);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // Simple contrast check (actual implementation would use proper algorithm)
          if (color === backgroundColor || 
              (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(255, 255, 255)')) {
            // This is just a placeholder - real implementation needs proper contrast calculation
          }
        }
      });
      
      // Heading structure analysis
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
      
      let headingIssues = 0;
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] - headingLevels[i-1] > 1) {
          headingIssues++;
        }
      }
      
      if (headingIssues > 0) {
        results.issues.push({
          type: 'accessibility',
          severity: 'medium',
          title: 'Heading Structure Issues',
          description: `${headingIssues} heading level jumps found`,
          impact: 'medium',
          fix: 'Use sequential heading levels (h1, h2, h3) without skipping',
          wcag: '1.3.1'
        });
      }
      
      // Focus management
      const focusableElements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      let focusIssues = 0;
      focusableElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex) > 0) {
          focusIssues++;
        }
      });
      
      if (focusIssues > 0) {
        results.recommendations.push({
          type: 'accessibility',
          category: 'keyboard',
          title: 'Avoid Positive Tab Index',
          description: `${focusIssues} elements use positive tabindex values`,
          impact: 'medium',
          suggestion: 'Use tabindex="0" or rely on natural tab order',
          wcag: '2.4.3'
        });
      }
      
      // ARIA usage analysis
      const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
      const ariaIssues = [];
      
      ariaElements.forEach(element => {
        const role = element.getAttribute('role');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledby = element.getAttribute('aria-labelledby');
        
        // Check for empty ARIA labels
        if (ariaLabel === '') {
          ariaIssues.push('Empty aria-label attribute');
        }
        
        // Check for invalid ARIA labelledby references
        if (ariaLabelledby) {
          const referencedElement = document.getElementById(ariaLabelledby);
          if (!referencedElement) {
            ariaIssues.push('aria-labelledby references non-existent element');
          }
        }
      });
      
      if (ariaIssues.length > 0) {
        results.issues.push({
          type: 'accessibility',
          severity: 'medium',
          title: 'ARIA Implementation Issues',
          description: `${ariaIssues.length} ARIA-related issues found`,
          impact: 'medium',
          fix: 'Review and fix ARIA attribute implementations',
          wcag: '4.1.2',
          details: ariaIssues
        });
      }
      
      // Calculate comprehensive scores
      results.scores.accessibilityScore = Math.max(0, 100 - (results.issues.length * 10));
      results.scores.wcagCompliance = results.issues.length === 0 ? 'AA' : 'Below AA';
      
      return results;
    });
    
    // Merge results
    return {
      issues: [...quickResults.issues, ...comprehensiveChecks.issues],
      recommendations: [...quickResults.recommendations, ...comprehensiveChecks.recommendations],
      metrics: { ...quickResults.metrics, ...comprehensiveChecks.metrics },
      scores: comprehensiveChecks.scores
    };
  }

  /**
   * Element-specific accessibility check
   */
  async elementCheck(page, selector) {
    if (!selector) {
      return await this.quickCheck(page);
    }
    
    const elementResults = await page.evaluate((sel) => {
      const results = {
        issues: [],
        recommendations: []
      };
      
      const elements = document.querySelectorAll(sel);
      
      elements.forEach((element, index) => {
        const tagName = element.tagName.toLowerCase();
        
        // Button accessibility
        if (tagName === 'button' || element.getAttribute('role') === 'button') {
          if (!element.textContent.trim() && !element.getAttribute('aria-label')) {
            results.issues.push({
              type: 'accessibility',
              severity: 'high',
              title: `Button ${index + 1} Missing Label`,
              description: 'Button lacks accessible name',
              impact: 'high',
              fix: 'Add text content or aria-label to button'
            });
          }
        }
        
        // Input accessibility
        if (tagName === 'input') {
          const type = element.type;
          const hasLabel = document.querySelector(`label[for="${element.id}"]`) ||
                          element.closest('label') ||
                          element.getAttribute('aria-label');
          
          if (!hasLabel && type !== 'hidden' && type !== 'submit') {
            results.issues.push({
              type: 'accessibility',
              severity: 'critical',
              title: `Input ${index + 1} Missing Label`,
              description: `${type} input lacks proper labeling`,
              impact: 'high',
              fix: 'Add label element or aria-label attribute'
            });
          }
        }
        
        // Link accessibility
        if (tagName === 'a') {
          const href = element.getAttribute('href');
          const text = element.textContent.trim();
          
          if (href && (!text || text.toLowerCase() === 'click here')) {
            results.recommendations.push({
              type: 'accessibility',
              category: 'navigation',
              title: `Link ${index + 1} Needs Better Text`,
              description: 'Link text should describe the destination',
              impact: 'medium',
              suggestion: 'Use descriptive link text instead of "click here"'
            });
          }
        }
        
        // Touch target size
        const rect = element.getBoundingClientRect();
        if ((tagName === 'button' || tagName === 'a') && 
            (rect.width < 44 || rect.height < 44)) {
          results.recommendations.push({
            type: 'accessibility',
            category: 'mobile',
            title: `${tagName.toUpperCase()} ${index + 1} Too Small`,
            description: `Touch target is ${Math.round(rect.width)}x${Math.round(rect.height)}px`,
            impact: 'medium',
            suggestion: 'Increase touch target to at least 44x44px for mobile accessibility'
          });
        }
      });
      
      return results;
    }, selector);
    
    return elementResults;
  }

  /**
   * Keyboard navigation testing
   */
  async testKeyboardNavigation(page) {
    const keyboardResults = await page.evaluate(() => {
      const focusableElements = Array.from(document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      
      const issues = [];
      
      // Check for keyboard traps
      let trapDetected = false;
      focusableElements.forEach((element, index) => {
        if (element.getAttribute('tabindex') === '0' && 
            index < focusableElements.length - 1) {
          const nextElement = focusableElements[index + 1];
          if (nextElement.getAttribute('tabindex') === '-1') {
            trapDetected = true;
          }
        }
      });
      
      if (trapDetected) {
        issues.push({
          type: 'accessibility',
          severity: 'high',
          title: 'Potential Keyboard Trap',
          description: 'Focus may become trapped in certain elements',
          impact: 'high',
          fix: 'Ensure keyboard users can navigate through all focusable elements'
        });
      }
      
      return { issues };
    });
    
    return keyboardResults;
  }
}

module.exports = AccessibilityAnalyzer;