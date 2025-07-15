/**
 * Bug Detector
 * Automated detection of common UI/UX bugs and issues
 */

class BugDetector {
  constructor(config = {}) {
    this.config = {
      checkConsoleErrors: config.checkConsoleErrors !== false,
      checkBrokenImages: config.checkBrokenImages !== false,
      checkBrokenLinks: config.checkBrokenLinks !== false,
      ...config
    };
  }

  /**
   * Quick bug scan (under 3 seconds)
   */
  async quickScan(page) {
    const consoleErrors = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    const bugResults = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // 1. Broken images detection
      const brokenImages = Array.from(document.images).filter(img => 
        !img.complete || img.naturalWidth === 0
      );
      
      if (brokenImages.length > 0) {
        results.issues.push({
          type: 'bug',
          severity: 'critical',
          title: 'Broken Images Detected',
          description: `${brokenImages.length} images failed to load`,
          impact: 'high',
          fix: 'Check image URLs and ensure they are accessible',
          count: brokenImages.length,
          category: 'content'
        });
      }
      
      // 2. Empty or missing content
      const emptyElements = Array.from(document.querySelectorAll('div, section, article')).filter(el => {
        return el.children.length === 0 && el.textContent.trim() === '';
      });
      
      if (emptyElements.length > 5) {
        results.recommendations.push({
          type: 'cleanup',
          category: 'code-quality',
          title: 'Empty Elements Found',
          description: `${emptyElements.length} empty container elements detected`,
          impact: 'low',
          suggestion: 'Remove unnecessary empty elements to clean up DOM'
        });
      }
      
      // 3. Overlapping elements detection
      const buttons = Array.from(document.querySelectorAll('button, a'));
      let overlappingElements = 0;
      
      for (let i = 0; i < buttons.length; i++) {
        const rect1 = buttons[i].getBoundingClientRect();
        for (let j = i + 1; j < buttons.length; j++) {
          const rect2 = buttons[j].getBoundingClientRect();
          
          if (rect1.left < rect2.right && rect2.left < rect1.right &&
              rect1.top < rect2.bottom && rect2.top < rect1.bottom) {
            overlappingElements++;
            break;
          }
        }
      }
      
      if (overlappingElements > 0) {
        results.issues.push({
          type: 'bug',
          severity: 'medium',
          title: 'Overlapping Interactive Elements',
          description: `${overlappingElements} interactive elements overlap`,
          impact: 'medium',
          fix: 'Adjust positioning to prevent element overlap',
          category: 'layout'
        });
      }
      
      // 4. Form validation issues
      const forms = Array.from(document.forms);
      let formIssues = 0;
      
      forms.forEach(form => {
        const requiredInputs = form.querySelectorAll('[required]');
        const submitButtons = form.querySelectorAll('[type="submit"], button[type="submit"]');
        
        if (requiredInputs.length > 0 && submitButtons.length === 0) {
          formIssues++;
        }
      });
      
      if (formIssues > 0) {
        results.issues.push({
          type: 'bug',
          severity: 'medium',
          title: 'Form Submission Issues',
          description: `${formIssues} forms with required fields lack submit buttons`,
          impact: 'medium',
          fix: 'Add submit buttons to forms with required fields',
          category: 'forms'
        });
      }
      
      // 5. Missing or broken links
      const externalLinks = Array.from(document.links).filter(link => {
        return link.href.startsWith('http') && !link.href.includes(window.location.hostname);
      });
      
      const suspiciousLinks = Array.from(document.links).filter(link => {
        return link.href === '#' || link.href === 'javascript:void(0)' || link.href === '';
      });
      
      if (suspiciousLinks.length > 0) {
        results.recommendations.push({
          type: 'ux',
          category: 'navigation',
          title: 'Non-functional Links',
          description: `${suspiciousLinks.length} links don't lead anywhere`,
          impact: 'low',
          suggestion: 'Replace placeholder links with actual destinations or remove them'
        });
      }
      
      // 6. Text overflow detection
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
      let overflowElements = 0;
      
      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.overflow === 'hidden' && el.scrollWidth > el.clientWidth) {
          overflowElements++;
        }
      });
      
      if (overflowElements > 0) {
        results.issues.push({
          type: 'bug',
          severity: 'medium',
          title: 'Text Overflow Detected',
          description: `${overflowElements} elements have hidden overflow text`,
          impact: 'medium',
          fix: 'Adjust text sizing or container width to prevent overflow',
          category: 'layout'
        });
      }
      
      // 7. Duplicate IDs
      const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
      const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
      
      if (duplicateIds.length > 0) {
        results.issues.push({
          type: 'bug',
          severity: 'high',
          title: 'Duplicate IDs Found',
          description: `${duplicateIds.length} duplicate ID attributes detected`,
          impact: 'high',
          fix: 'Ensure all ID attributes are unique across the page',
          category: 'html-validation'
        });
      }
      
      // Metrics
      results.metrics.totalImages = document.images.length;
      results.metrics.totalLinks = document.links.length;
      results.metrics.totalForms = document.forms.length;
      results.metrics.totalButtons = document.querySelectorAll('button').length;
      
      return results;
    });
    
    // Add console errors to results
    if (consoleErrors.length > 0) {
      bugResults.issues.push({
        type: 'bug',
        severity: 'high',
        title: 'JavaScript Console Errors',
        description: `${consoleErrors.length} JavaScript errors detected`,
        impact: 'high',
        fix: 'Check browser console and fix JavaScript errors',
        category: 'javascript',
        details: consoleErrors.slice(0, 5) // Limit to first 5 errors
      });
    }
    
    bugResults.metrics.consoleErrors = consoleErrors.length;
    
    return bugResults;
  }

  /**
   * Network-related bug detection
   */
  async networkBugScan(page) {
    const networkIssues = [];
    
    // Monitor failed network requests
    page.on('response', response => {
      if (response.status() >= 400) {
        networkIssues.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Wait a bit for network requests to complete
    await page.waitForTimeout(2000);
    
    const results = {
      issues: [],
      recommendations: [],
      metrics: {}
    };
    
    if (networkIssues.length > 0) {
      const grouped = networkIssues.reduce((acc, issue) => {
        const status = issue.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(issue);
        return acc;
      }, {});
      
      Object.entries(grouped).forEach(([status, issues]) => {
        results.issues.push({
          type: 'bug',
          severity: status.startsWith('4') ? 'high' : 'medium',
          title: `HTTP ${status} Errors`,
          description: `${issues.length} requests failed with ${status} status`,
          impact: status.startsWith('4') ? 'high' : 'medium',
          fix: `Fix ${status} errors - check resource URLs and server configuration`,
          category: 'network',
          details: issues.slice(0, 3).map(i => i.url)
        });
      });
    }
    
    results.metrics.networkErrors = networkIssues.length;
    
    return results;
  }

  /**
   * Comprehensive bug detection
   */
  async fullBugScan(page) {
    const quickResults = await this.quickScan(page);
    const networkResults = await this.networkBugScan(page);
    
    // Additional comprehensive checks
    const comprehensiveResults = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // CSS-related issues
      const elementsWithInlineStyles = document.querySelectorAll('[style]');
      if (elementsWithInlineStyles.length > 10) {
        results.recommendations.push({
          type: 'code-quality',
          category: 'css',
          title: 'Excessive Inline Styles',
          description: `${elementsWithInlineStyles.length} elements use inline styles`,
          impact: 'low',
          suggestion: 'Move inline styles to CSS classes for better maintainability'
        });
      }
      
      // Accessibility-related bugs
      const clickableElementsWithoutCursor = Array.from(
        document.querySelectorAll('div, span')
      ).filter(el => {
        const hasClickHandler = el.onclick || el.addEventListener;
        const styles = window.getComputedStyle(el);
        return hasClickHandler && styles.cursor !== 'pointer';
      });
      
      if (clickableElementsWithoutCursor.length > 0) {
        results.issues.push({
          type: 'bug',
          severity: 'low',
          title: 'Clickable Elements Without Pointer Cursor',
          description: `${clickableElementsWithoutCursor.length} clickable elements lack pointer cursor`,
          impact: 'low',
          fix: 'Add cursor: pointer to clickable elements',
          category: 'ux'
        });
      }
      
      // Performance-related bugs
      const largeInlineScripts = Array.from(document.scripts).filter(script => 
        !script.src && script.textContent.length > 5000
      );
      
      if (largeInlineScripts.length > 0) {
        results.recommendations.push({
          type: 'performance',
          category: 'optimization',
          title: 'Large Inline Scripts',
          description: `${largeInlineScripts.length} large inline scripts found`,
          impact: 'medium',
          suggestion: 'Move large scripts to external files for better caching'
        });
      }
      
      return results;
    });
    
    // Merge all results
    return {
      issues: [
        ...quickResults.issues,
        ...networkResults.issues,
        ...comprehensiveResults.issues
      ],
      recommendations: [
        ...quickResults.recommendations,
        ...networkResults.recommendations,
        ...comprehensiveResults.recommendations
      ],
      metrics: {
        ...quickResults.metrics,
        ...networkResults.metrics,
        ...comprehensiveResults.metrics
      }
    };
  }

  /**
   * Mobile-specific bug detection
   */
  async mobileBugScan(page) {
    const mobileResults = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // Touch target size issues
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      let smallTouchTargets = 0;
      
      interactiveElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          smallTouchTargets++;
        }
      });
      
      if (smallTouchTargets > 0) {
        results.issues.push({
          type: 'bug',
          severity: 'medium',
          title: 'Small Touch Targets',
          description: `${smallTouchTargets} interactive elements are too small for mobile`,
          impact: 'medium',
          fix: 'Increase touch target size to at least 44x44px',
          category: 'mobile'
        });
      }
      
      // Viewport meta tag check
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        results.issues.push({
          type: 'bug',
          severity: 'high',
          title: 'Missing Viewport Meta Tag',
          description: 'Page lacks viewport meta tag for mobile optimization',
          impact: 'high',
          fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
          category: 'mobile'
        });
      }
      
      // Horizontal scrolling check
      if (document.body.scrollWidth > window.innerWidth) {
        results.issues.push({
          type: 'bug',
          severity: 'medium',
          title: 'Horizontal Scrolling Detected',
          description: 'Page has horizontal overflow on mobile',
          impact: 'medium',
          fix: 'Ensure content fits within viewport width',
          category: 'mobile'
        });
      }
      
      results.metrics.smallTouchTargets = smallTouchTargets;
      results.metrics.hasViewportMeta = !!viewportMeta;
      results.metrics.hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
      
      return results;
    });
    
    return mobileResults;
  }
}

module.exports = BugDetector;