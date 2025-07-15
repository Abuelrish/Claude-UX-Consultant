/**
 * JSON Reporter
 * Generates machine-readable analysis output for API consumption and CI/CD
 */

const fs = require('fs').promises;

class JSONReporter {
  async generate(analysisResults, options = {}) {
    const outputPath = options.outputPath || `./reports/ux-analysis-${Date.now()}.json`;
    
    const reportData = {
      meta: {
        version: '1.0.0',
        generator: 'Claude UX Consultant',
        timestamp: new Date().toISOString(),
        url: analysisResults.url,
        analysisType: analysisResults.analysisType,
        analysisTime: analysisResults.analysisTime
      },
      summary: {
        overallScore: analysisResults.summary?.overallScore || 0,
        totalIssues: analysisResults.issues?.length || 0,
        criticalIssues: analysisResults.issues?.filter(i => i.severity === 'critical' || i.impact === 'high').length || 0,
        highIssues: analysisResults.issues?.filter(i => i.severity === 'high' || i.impact === 'medium').length || 0,
        mediumIssues: analysisResults.issues?.filter(i => i.severity === 'medium' || i.impact === 'low').length || 0,
        lowIssues: analysisResults.issues?.filter(i => i.severity === 'low').length || 0,
        recommendations: analysisResults.recommendations?.length || 0,
        quickWins: analysisResults.recommendations?.filter(r => r.effort === 'low' || r.impact === 'quick').length || 0,
        estimatedFixTime: analysisResults.summary?.estimatedFixTime || 0
      },
      issues: (analysisResults.issues || []).map(issue => ({
        id: this.generateId(issue.title),
        type: issue.type,
        severity: issue.severity || issue.impact || 'medium',
        title: issue.title,
        description: issue.description,
        category: issue.category,
        impact: issue.impact || issue.severity,
        fix: issue.fix || issue.solution,
        wcag: issue.wcag,
        count: issue.count,
        details: issue.details
      })),
      recommendations: (analysisResults.recommendations || []).map(rec => ({
        id: this.generateId(rec.title),
        type: rec.type,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        effort: rec.effort,
        suggestion: rec.suggestion || rec.fix,
        priority: this.calculatePriority(rec)
      })),
      metrics: analysisResults.metrics || {},
      scores: analysisResults.scores || {},
      screenshots: (analysisResults.screenshots || []).map(screenshot => ({
        path: screenshot,
        type: this.getScreenshotType(screenshot),
        timestamp: new Date().toISOString()
      })),
      categories: this.categorizeResults(analysisResults),
      compliance: this.assessCompliance(analysisResults),
      trends: this.calculateTrends(analysisResults)
    };
    
    await fs.writeFile(outputPath, JSON.stringify(reportData, null, 2));
    
    return outputPath;
  }

  generateId(title) {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  calculatePriority(recommendation) {
    const impactWeight = {
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    const effortWeight = {
      'low': 3,
      'medium': 2,
      'high': 1
    };
    
    const impact = impactWeight[recommendation.impact] || 2;
    const effort = effortWeight[recommendation.effort] || 2;
    
    const score = impact + effort;
    
    if (score >= 5) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  getScreenshotType(screenshotPath) {
    if (screenshotPath.includes('mobile')) return 'mobile';
    if (screenshotPath.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  categorizeResults(analysisResults) {
    const categories = {
      accessibility: {
        issues: 0,
        recommendations: 0,
        score: 0
      },
      performance: {
        issues: 0,
        recommendations: 0,
        score: 0
      },
      visual: {
        issues: 0,
        recommendations: 0,
        score: 0
      },
      mobile: {
        issues: 0,
        recommendations: 0,
        score: 0
      },
      bug: {
        issues: 0,
        recommendations: 0,
        score: 0
      }
    };

    // Count issues by category
    (analysisResults.issues || []).forEach(issue => {
      const category = issue.type || issue.category || 'other';
      if (categories[category]) {
        categories[category].issues++;
      }
    });

    // Count recommendations by category
    (analysisResults.recommendations || []).forEach(rec => {
      const category = rec.type || rec.category || 'other';
      if (categories[category]) {
        categories[category].recommendations++;
      }
    });

    // Calculate scores
    Object.keys(categories).forEach(category => {
      const issues = categories[category].issues;
      const baseScore = 100;
      const penalty = issues * 15;
      categories[category].score = Math.max(0, baseScore - penalty);
    });

    return categories;
  }

  assessCompliance(analysisResults) {
    const compliance = {
      wcag: {
        level: 'Unknown',
        violations: 0,
        compliant: false
      },
      mobile: {
        responsive: true,
        touchFriendly: true,
        issues: 0
      },
      performance: {
        coreWebVitals: 'Unknown',
        loadTime: analysisResults.metrics?.loadTime || 0,
        score: analysisResults.scores?.performanceScore || 0
      }
    };

    // WCAG compliance assessment
    const accessibilityIssues = (analysisResults.issues || []).filter(issue => 
      issue.type === 'accessibility' || issue.wcag
    );
    
    compliance.wcag.violations = accessibilityIssues.length;
    
    if (accessibilityIssues.length === 0) {
      compliance.wcag.level = 'AA';
      compliance.wcag.compliant = true;
    } else if (accessibilityIssues.filter(i => i.severity === 'critical').length === 0) {
      compliance.wcag.level = 'Partial AA';
      compliance.wcag.compliant = false;
    } else {
      compliance.wcag.level = 'Below AA';
      compliance.wcag.compliant = false;
    }

    // Mobile compliance
    const mobileIssues = (analysisResults.issues || []).filter(issue => 
      issue.type === 'mobile'
    );
    
    compliance.mobile.issues = mobileIssues.length;
    compliance.mobile.responsive = !mobileIssues.some(i => i.title.includes('Viewport'));
    compliance.mobile.touchFriendly = !mobileIssues.some(i => i.title.includes('Touch Target'));

    // Performance compliance
    if (analysisResults.metrics?.largestContentfulPaint) {
      const lcp = analysisResults.metrics.largestContentfulPaint;
      const fid = analysisResults.metrics.firstInputDelay || 0;
      const cls = analysisResults.metrics.cumulativeLayoutShift || 0;
      
      if (lcp <= 2500 && fid <= 100 && cls <= 0.1) {
        compliance.performance.coreWebVitals = 'Good';
      } else if (lcp <= 4000 && fid <= 300 && cls <= 0.25) {
        compliance.performance.coreWebVitals = 'Needs Improvement';
      } else {
        compliance.performance.coreWebVitals = 'Poor';
      }
    }

    return compliance;
  }

  calculateTrends(analysisResults) {
    // This would be enhanced with historical data in a real implementation
    return {
      scoreChange: 0,
      issuesTrend: 'stable',
      newIssues: 0,
      resolvedIssues: 0,
      lastAnalysis: null,
      improvementAreas: this.identifyImprovementAreas(analysisResults)
    };
  }

  identifyImprovementAreas(analysisResults) {
    const areas = [];
    
    const categories = this.categorizeResults(analysisResults);
    
    // Find categories with most issues
    Object.entries(categories).forEach(([category, data]) => {
      if (data.issues > 2) {
        areas.push({
          category,
          issues: data.issues,
          priority: data.issues > 5 ? 'high' : 'medium'
        });
      }
    });
    
    // Sort by number of issues
    areas.sort((a, b) => b.issues - a.issues);
    
    return areas.slice(0, 3); // Top 3 areas for improvement
  }
}

module.exports = JSONReporter;