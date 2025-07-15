#!/usr/bin/env node

/**
 * Claude UX Consultant - Main Orchestrator Agent
 * 
 * Provides immediate feedback for UX analysis with AI-powered insights
 * No external APIs required - completely local analysis
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const AccessibilityAnalyzer = require('./analyzers/accessibility');
const PerformanceAnalyzer = require('./analyzers/performance');
const VisualAnalyzer = require('./analyzers/visual');
const MobileAnalyzer = require('./analyzers/mobile');
const BugDetector = require('./analyzers/bug-detector');
const HTMLReporter = require('./reporters/html-reporter');
const JSONReporter = require('./reporters/json-reporter');
const MarkdownReporter = require('./reporters/markdown-reporter');

class UXOrchestrator {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:3000',
      outputDir: config.outputDir || './reports',
      screenshotDir: config.screenshotDir || './screenshots',
      timeout: config.timeout || 30000,
      viewport: config.viewport || { width: 1920, height: 1080 },
      mobileViewport: config.mobileViewport || { width: 375, height: 667 },
      ...config
    };
    
    this.browser = null;
    this.context = null;
    this.analyzers = this.initializeAnalyzers();
    this.reporters = this.initializeReporters();
  }

  initializeAnalyzers() {
    return {
      accessibility: new AccessibilityAnalyzer(),
      performance: new PerformanceAnalyzer(),
      visual: new VisualAnalyzer(),
      mobile: new MobileAnalyzer(),
      bugDetector: new BugDetector()
    };
  }

  initializeReporters() {
    return {
      html: new HTMLReporter(),
      json: new JSONReporter(),
      markdown: new MarkdownReporter()
    };
  }

  async initialize() {
    console.log('🎯 Initializing Claude UX Consultant...');
    
    // Ensure directories exist
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(this.config.screenshotDir, { recursive: true });
    
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      userAgent: 'Claude-UX-Consultant/1.0'
    });
    
    console.log('✅ Claude UX Consultant initialized and ready');
  }

  /**
   * Main analysis entry point
   */
  async analyzePage(url, analysisType = 'quick', options = {}) {
    const startTime = Date.now();
    console.log(`🔍 Analyzing ${url} (${analysisType} analysis)...`);
    
    const page = await this.context.newPage();
    const results = {
      url,
      analysisType,
      timestamp: new Date().toISOString(),
      issues: [],
      recommendations: [],
      screenshots: [],
      metrics: {},
      scores: {},
      summary: {}
    };
    
    try {
      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout 
      });
      
      // Take screenshot
      const screenshotPath = await this.captureScreenshot(page, url);
      results.screenshots.push(screenshotPath);
      
      // Run analysis based on type
      switch (analysisType) {
        case 'quick':
          await this.runQuickAnalysis(page, results);
          break;
        case 'deep':
          await this.runDeepAnalysis(page, results);
          break;
        case 'element':
          await this.runElementAnalysis(page, results, options.selector);
          break;
        case 'full':
          await this.runFullAnalysis(page, results);
          break;
      }
      
      // Calculate summary
      this.calculateSummary(results);
      
      const duration = Date.now() - startTime;
      results.analysisTime = `${duration}ms`;
      
      console.log(`✅ Analysis completed in ${duration}ms - Found ${results.issues.length} issues`);
      
      return results;
      
    } catch (error) {
      console.error(`❌ Error analyzing ${url}:`, error.message);
      results.error = error.message;
      return results;
    } finally {
      await page.close();
    }
  }

  /**
   * Quick 5-second analysis for immediate feedback
   */
  async runQuickAnalysis(page, results) {
    console.log('⚡ Running quick analysis (5-second feedback)...');
    
    const analysisPromises = [
      this.analyzers.bugDetector.quickScan(page),
      this.analyzers.accessibility.quickCheck(page),
      this.analyzers.performance.quickMetrics(page)
    ];
    
    const analysisResults = await Promise.allSettled(analysisPromises);
    
    analysisResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.issues.push(...(result.value.issues || []));
        results.recommendations.push(...(result.value.recommendations || []));
        Object.assign(results.metrics, result.value.metrics || {});
      }
    });
  }

  /**
   * Deep comprehensive analysis
   */
  async runDeepAnalysis(page, results) {
    console.log('🔬 Running deep analysis...');
    
    // Run quick analysis first
    await this.runQuickAnalysis(page, results);
    
    // Add deep analysis
    const deepAnalysisPromises = [
      this.analyzers.accessibility.fullAudit(page),
      this.analyzers.visual.comprehensiveAnalysis(page),
      this.analyzers.performance.detailedMetrics(page),
      this.analyzers.mobile.responsivenessTest(page)
    ];
    
    const deepResults = await Promise.allSettled(deepAnalysisPromises);
    
    deepResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.issues.push(...(result.value.issues || []));
        results.recommendations.push(...(result.value.recommendations || []));
        Object.assign(results.metrics, result.value.metrics || {});
        Object.assign(results.scores, result.value.scores || {});
      }
    });
  }

  /**
   * Element-specific analysis
   */
  async runElementAnalysis(page, results, selector) {
    console.log(`🎯 Running element-specific analysis for: ${selector || 'common elements'}`);
    
    const elementResults = await this.analyzers.visual.elementAnalysis(page, selector);
    const accessibilityResults = await this.analyzers.accessibility.elementCheck(page, selector);
    
    results.issues.push(...elementResults.issues, ...accessibilityResults.issues);
    results.recommendations.push(...elementResults.recommendations, ...accessibilityResults.recommendations);
  }

  /**
   * Full comprehensive analysis with all features
   */
  async runFullAnalysis(page, results) {
    console.log('🚀 Running full comprehensive analysis...');
    
    await this.runDeepAnalysis(page, results);
    
    // Add mobile testing
    const mobileContext = await this.browser.newContext({
      viewport: this.config.mobileViewport,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(results.url);
    
    const mobileScreenshot = await this.captureScreenshot(mobilePage, results.url, 'mobile');
    results.screenshots.push(mobileScreenshot);
    
    const mobileResults = await this.analyzers.mobile.fullMobileAudit(mobilePage);
    results.issues.push(...mobileResults.issues);
    results.recommendations.push(...mobileResults.recommendations);
    
    await mobilePage.close();
    await mobileContext.close();
  }

  async captureScreenshot(page, url, suffix = '') {
    const filename = this.sanitizeFilename(url) + (suffix ? `-${suffix}` : '') + `-${Date.now()}.png`;
    const screenshotPath = path.join(this.config.screenshotDir, filename);
    
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true,
      timeout: 10000
    });
    
    return screenshotPath;
  }

  calculateSummary(results) {
    const criticalIssues = results.issues.filter(i => i.severity === 'critical' || i.impact === 'high');
    const highIssues = results.issues.filter(i => i.severity === 'high' || i.impact === 'medium');
    const mediumIssues = results.issues.filter(i => i.severity === 'medium' || i.impact === 'low');
    
    results.summary = {
      totalIssues: results.issues.length,
      criticalIssues: criticalIssues.length,
      highIssues: highIssues.length,
      mediumIssues: mediumIssues.length,
      recommendations: results.recommendations.length,
      overallScore: this.calculateOverallScore(results),
      estimatedFixTime: this.estimateFixTime(results.issues),
      priorityActions: this.getPriorityActions(results.issues),
      quickWins: results.recommendations.filter(r => r.effort === 'low' || r.impact === 'quick').length
    };
  }

  calculateOverallScore(results) {
    const maxScore = 100;
    const criticalPenalty = results.summary?.criticalIssues * 20;
    const highPenalty = results.summary?.highIssues * 10;
    const mediumPenalty = results.summary?.mediumIssues * 5;
    
    return Math.max(0, maxScore - criticalPenalty - highPenalty - mediumPenalty);
  }

  estimateFixTime(issues) {
    const timeEstimates = {
      critical: 120,  // 2 hours
      high: 60,       // 1 hour
      medium: 30,     // 30 minutes
      low: 15         // 15 minutes
    };
    
    return issues.reduce((total, issue) => {
      const severity = issue.severity || issue.impact || 'medium';
      return total + (timeEstimates[severity] || 30);
    }, 0);
  }

  getPriorityActions(issues) {
    return issues
      .filter(issue => issue.severity === 'critical' || issue.impact === 'high')
      .slice(0, 3)
      .map(issue => ({
        title: issue.title,
        description: issue.description,
        action: issue.fix || issue.solution,
        impact: issue.impact || issue.severity
      }));
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(analysisResults, format = 'html') {
    const timestamp = Date.now();
    const reportName = `ux-analysis-${timestamp}`;
    
    let reportPath;
    switch (format) {
      case 'html':
        reportPath = await this.reporters.html.generate(analysisResults, {
          outputPath: path.join(this.config.outputDir, `${reportName}.html`),
          includeScreenshots: true
        });
        break;
      case 'json':
        reportPath = await this.reporters.json.generate(analysisResults, {
          outputPath: path.join(this.config.outputDir, `${reportName}.json`)
        });
        break;
      case 'markdown':
        reportPath = await this.reporters.markdown.generate(analysisResults, {
          outputPath: path.join(this.config.outputDir, `${reportName}.md`)
        });
        break;
    }
    
    return reportPath;
  }

  /**
   * Console output for immediate feedback
   */
  displayImmediateFeedback(results) {
    console.log('\\n🎯 IMMEDIATE FEEDBACK:');
    console.log('========================');
    console.log(`📊 Total Issues: ${results.summary.totalIssues}`);
    console.log(`🚨 Critical Issues: ${results.summary.criticalIssues}`);
    console.log(`⚡ Quick Wins: ${results.summary.quickWins}`);
    console.log(`⏱️  Estimated Fix Time: ${results.summary.estimatedFixTime} minutes`);
    console.log(`📈 Overall Score: ${results.summary.overallScore}/100`);
    
    if (results.summary.priorityActions.length > 0) {
      console.log('\\n🔥 PRIORITY ACTIONS:');
      results.summary.priorityActions.forEach((action, i) => {
        console.log(`${i + 1}. ${action.title}: ${action.action}`);
      });
    }
    
    const nextSteps = this.generateNextSteps(results);
    if (nextSteps.length > 0) {
      console.log('\\n📋 NEXT STEPS:');
      nextSteps.forEach((step, i) => {
        console.log(`${i + 1}. ${step}`);
      });
    }
  }

  generateNextSteps(results) {
    const steps = [];
    
    if (results.summary.criticalIssues > 0) {
      steps.push(`🚨 Fix ${results.summary.criticalIssues} critical issues immediately`);
    }
    
    if (results.summary.highIssues > 0) {
      steps.push(`🔴 Address ${results.summary.highIssues} high priority issues this sprint`);
    }
    
    if (results.summary.quickWins > 0) {
      steps.push(`⚡ Implement ${results.summary.quickWins} quick wins for easy improvements`);
    }
    
    if (results.issues.length === 0) {
      steps.push('✅ Great job! No major issues found. Consider running deep analysis for optimization opportunities.');
    }
    
    return steps;
  }

  sanitizeFilename(url) {
    return url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI Interface
async function runCLI() {
  const args = process.argv.slice(2);
  const command = args[0];
  const url = args[1];
  
  if (!command || !url) {
    console.log(`
🎯 Claude UX Consultant - AI-Powered UX Analysis

Usage:
  node orchestrator.js <command> <url> [options]

Commands:
  quick <url>           - Quick 5-second analysis
  deep <url>            - Deep comprehensive analysis  
  element <url> <sel>   - Element-specific analysis
  full <url>            - Full analysis with mobile testing
  monitor <url>         - Continuous monitoring

Examples:
  node orchestrator.js quick http://localhost:3000
  node orchestrator.js deep https://example.com/dashboard
  node orchestrator.js element http://localhost:3000 "button"
  node orchestrator.js full https://example.com --report html
    `);
    return;
  }
  
  const orchestrator = new UXOrchestrator();
  
  try {
    await orchestrator.initialize();
    
    let results;
    const options = {
      selector: args[2],
      format: args.includes('--report') ? args[args.indexOf('--report') + 1] : 'html'
    };
    
    switch (command) {
      case 'quick':
        results = await orchestrator.analyzePage(url, 'quick');
        break;
      case 'deep':
        results = await orchestrator.analyzePage(url, 'deep');
        break;
      case 'element':
        results = await orchestrator.analyzePage(url, 'element', options);
        break;
      case 'full':
        results = await orchestrator.analyzePage(url, 'full');
        break;
      case 'monitor':
        console.log('🔄 Starting continuous monitoring...');
        setInterval(async () => {
          const monitorResults = await orchestrator.analyzePage(url, 'quick');
          orchestrator.displayImmediateFeedback(monitorResults);
        }, 60000); // Every minute
        return;
      default:
        console.log('❌ Unknown command. Use: quick, deep, element, full, or monitor');
        return;
    }
    
    // Display immediate feedback
    orchestrator.displayImmediateFeedback(results);
    
    // Generate report if requested
    if (args.includes('--report')) {
      const reportPath = await orchestrator.generateReport(results, options.format);
      console.log(`\\n📁 Report generated: ${reportPath}`);
    }
    
  } catch (error) {
    console.error('❌ Claude UX Consultant error:', error.message);
  } finally {
    await orchestrator.close();
  }
}

// Export for programmatic use
module.exports = UXOrchestrator;

// Run CLI if called directly
if (require.main === module) {
  runCLI().catch(console.error);
}