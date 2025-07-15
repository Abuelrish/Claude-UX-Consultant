/**
 * Visual Design Analyzer
 * Analyzes visual design consistency, hierarchy, and aesthetics
 */

class VisualAnalyzer {
  constructor(config = {}) {
    this.config = {
      checkColorContrast: config.checkColorContrast !== false,
      checkTypography: config.checkTypography !== false,
      checkLayout: config.checkLayout !== false,
      ...config
    };
  }

  /**
   * Basic visual analysis
   */
  async basicAnalysis(page) {
    const visualResults = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {}
      };
      
      // Typography analysis
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const paragraphs = Array.from(document.querySelectorAll('p'));
      
      // Check for multiple font families
      const fontFamilies = new Set();
      [...headings, ...paragraphs].forEach(el => {
        const style = window.getComputedStyle(el);
        fontFamilies.add(style.fontFamily);
      });
      
      if (fontFamilies.size > 3) {
        results.recommendations.push({
          type: 'visual',
          category: 'typography',
          title: 'Too Many Font Families',
          description: `${fontFamilies.size} different font families detected`,
          impact: 'medium',
          suggestion: 'Limit to 2-3 font families for better consistency'
        });
      }
      
      // Color analysis
      const colors = new Set();
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.color && style.color !== 'rgb(0, 0, 0)') {
          colors.add(style.color);
        }
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(style.backgroundColor);
        }
      });
      
      results.metrics.uniqueColors = colors.size;
      
      if (colors.size > 20) {
        results.recommendations.push({
          type: 'visual',
          category: 'color',
          title: 'Too Many Colors',
          description: `${colors.size} unique colors found`,
          impact: 'low',
          suggestion: 'Consider using a more limited color palette'
        });
      }
      
      // Layout consistency
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonStyles = buttons.map(btn => {
        const style = window.getComputedStyle(btn);
        return {
          height: style.height,
          padding: style.padding,
          borderRadius: style.borderRadius,
          backgroundColor: style.backgroundColor
        };
      });
      
      // Check for inconsistent button styles
      const uniqueButtonStyles = new Set(buttonStyles.map(s => JSON.stringify(s)));
      if (uniqueButtonStyles.size > 3 && buttons.length > 3) {
        results.recommendations.push({
          type: 'visual',
          category: 'consistency',
          title: 'Inconsistent Button Styles',
          description: `${uniqueButtonStyles.size} different button styles found`,
          impact: 'medium',
          suggestion: 'Standardize button appearance for better consistency'
        });
      }
      
      // Spacing analysis
      const elements = Array.from(document.querySelectorAll('div, section, article, p, h1, h2, h3'));
      const margins = elements.map(el => {
        const style = window.getComputedStyle(el);
        return {
          marginTop: parseInt(style.marginTop),
          marginBottom: parseInt(style.marginBottom)
        };
      });
      
      const uniqueMargins = new Set(margins.map(m => `${m.marginTop}-${m.marginBottom}`));
      if (uniqueMargins.size > 10) {
        results.recommendations.push({
          type: 'visual',
          category: 'spacing',
          title: 'Inconsistent Spacing',
          description: `${uniqueMargins.size} different margin combinations found`,
          impact: 'low',
          suggestion: 'Use consistent spacing values (e.g., 8px, 16px, 24px, 32px)'
        });
      }
      
      // Image analysis
      const images = Array.from(document.images);
      const imagesWithoutDimensions = images.filter(img => 
        !img.width || !img.height || img.width === 0 || img.height === 0
      );
      
      if (imagesWithoutDimensions.length > 0) {
        results.issues.push({
          type: 'visual',
          severity: 'medium',
          title: 'Images Without Dimensions',
          description: `${imagesWithoutDimensions.length} images lack proper dimensions`,
          impact: 'medium',
          fix: 'Set explicit width and height attributes on images'
        });
      }
      
      results.metrics.totalImages = images.length;
      results.metrics.totalButtons = buttons.length;
      results.metrics.totalHeadings = headings.length;
      results.metrics.fontFamilies = fontFamilies.size;
      
      return results;
    });
    
    return visualResults;
  }

  /**
   * Comprehensive visual analysis
   */
  async comprehensiveAnalysis(page) {
    const basicResults = await this.basicAnalysis(page);
    
    // Add more detailed analysis
    const comprehensiveResults = await page.evaluate(() => {
      const results = {
        issues: [],
        recommendations: [],
        metrics: {},
        scores: {}
      };
      
      // Advanced typography analysis
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
      let readabilityIssues = 0;
      
      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseInt(style.fontSize);
        const lineHeight = parseInt(style.lineHeight);
        
        // Check for very small text
        if (fontSize < 14) {
          readabilityIssues++;
        }
        
        // Check for poor line height
        if (lineHeight && lineHeight < fontSize * 1.2) {
          readabilityIssues++;
        }
      });
      
      if (readabilityIssues > 0) {
        results.issues.push({
          type: 'visual',
          severity: 'medium',
          title: 'Readability Issues',
          description: `${readabilityIssues} text elements may be hard to read`,
          impact: 'medium',
          fix: 'Increase font size to 14px+ and line-height to 1.2x font size'
        });
      }
      
      // Visual hierarchy analysis
      const h1s = document.querySelectorAll('h1');
      const h2s = document.querySelectorAll('h2');
      
      if (h1s.length === 0) {
        results.issues.push({
          type: 'visual',
          severity: 'medium',
          title: 'Missing Primary Heading',
          description: 'Page lacks h1 heading for visual hierarchy',
          impact: 'medium',
          fix: 'Add h1 heading to establish page hierarchy'
        });
      }
      
      if (h1s.length > 1) {
        results.recommendations.push({
          type: 'visual',
          category: 'hierarchy',
          title: 'Multiple H1 Headings',
          description: `${h1s.length} h1 headings found`,
          impact: 'low',
          suggestion: 'Consider using only one h1 per page'
        });
      }
      
      // Color contrast analysis (simplified)
      const contrastIssues = [];
      document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, button, a').forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Simple contrast check (would need proper algorithm in production)
        if (color === backgroundColor) {
          contrastIssues.push(el.tagName);
        }
      });
      
      if (contrastIssues.length > 0) {
        results.issues.push({
          type: 'visual',
          severity: 'high',
          title: 'Color Contrast Issues',
          description: `${contrastIssues.length} elements may have poor contrast`,
          impact: 'high',
          fix: 'Ensure 4.5:1 contrast ratio for normal text, 3:1 for large text'
        });
      }
      
      // Layout analysis
      const layoutElements = document.querySelectorAll('div, section, article, main, aside, nav');
      let layoutIssues = 0;
      
      layoutElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        
        // Check for very wide content
        if (rect.width > 1200) {
          layoutIssues++;
        }
        
        // Check for very tall content without breaks
        if (rect.height > 2000 && !el.querySelector('h1, h2, h3')) {
          layoutIssues++;
        }
      });
      
      if (layoutIssues > 0) {
        results.recommendations.push({
          type: 'visual',
          category: 'layout',
          title: 'Layout Optimization',
          description: `${layoutIssues} layout elements could be improved`,
          impact: 'low',
          suggestion: 'Consider max-width constraints and content breaks'
        });
      }
      
      // Visual consistency score
      let consistencyScore = 100;
      if (results.issues.length > 0) {
        consistencyScore -= results.issues.length * 10;
      }
      if (results.recommendations.length > 0) {
        consistencyScore -= results.recommendations.length * 5;
      }
      
      results.scores.visualConsistency = Math.max(0, consistencyScore);
      results.scores.readabilityScore = Math.max(0, 100 - (readabilityIssues * 10));
      
      return results;
    });
    
    // Merge results
    return {
      issues: [...basicResults.issues, ...comprehensiveResults.issues],
      recommendations: [...basicResults.recommendations, ...comprehensiveResults.recommendations],
      metrics: { ...basicResults.metrics, ...comprehensiveResults.metrics },
      scores: comprehensiveResults.scores
    };
  }

  /**
   * Element-specific visual analysis
   */
  async elementAnalysis(page, selector) {
    if (!selector) {
      return await this.basicAnalysis(page);
    }
    
    const elementResults = await page.evaluate((sel) => {
      const results = {
        issues: [],
        recommendations: []
      };
      
      const elements = document.querySelectorAll(sel);
      
      elements.forEach((element, index) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        // Check element visibility
        if (rect.width === 0 || rect.height === 0) {
          results.issues.push({
            type: 'visual',
            severity: 'medium',
            title: `Element ${index + 1} Not Visible`,
            description: 'Element has zero dimensions',
            impact: 'medium',
            fix: 'Check CSS display, visibility, or dimensions'
          });
        }
        
        // Check for missing background on important elements
        if (element.tagName === 'BUTTON' && 
            style.backgroundColor === 'rgba(0, 0, 0, 0)') {
          results.recommendations.push({
            type: 'visual',
            category: 'styling',
            title: `Button ${index + 1} Needs Background`,
            description: 'Button lacks background color',
            impact: 'low',
            suggestion: 'Add background color to make button more prominent'
          });
        }
        
        // Check text content styling
        if (element.textContent.trim() && parseInt(style.fontSize) < 14) {
          results.issues.push({
            type: 'visual',
            severity: 'medium',
            title: `Element ${index + 1} Text Too Small`,
            description: `Font size is ${style.fontSize}`,
            impact: 'medium',
            fix: 'Increase font size to at least 14px for better readability'
          });
        }
        
        // Check for proper spacing
        const margin = parseInt(style.marginTop) + parseInt(style.marginBottom);
        const padding = parseInt(style.paddingTop) + parseInt(style.paddingBottom);
        
        if (element.tagName === 'BUTTON' && padding < 16) {
          results.recommendations.push({
            type: 'visual',
            category: 'spacing',
            title: `Button ${index + 1} Needs More Padding`,
            description: 'Button padding may be too small',
            impact: 'low',
            suggestion: 'Add padding for better touch target size'
          });
        }
      });
      
      return results;
    }, selector);
    
    return elementResults;
  }
}

module.exports = VisualAnalyzer;