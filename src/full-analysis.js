#!/usr/bin/env node

/**
 * Claude UX Consultant - Full Analysis Script
 * 
 * Comprehensive UX analysis with all features enabled:
 * - Deep accessibility audit (WCAG 2.1 compliance)
 * - Complete performance analysis (Core Web Vitals)
 * - Visual design review
 * - Mobile responsiveness testing
 * - Bug detection and error scanning
 * - Detailed reporting in multiple formats
 */

const UXOrchestrator = require('./orchestrator');
const path = require('path');

async function runFullAnalysis() {
  const args = process.argv.slice(2);
  const url = args[0];
  
  if (!url) {
    console.log(`
🎯 Claude UX Consultant - Full Analysis

Usage:
  npm run full-analysis <url> [options]

Options:
  --format <type>    Report format: html, json, markdown (default: html)
  --output <dir>     Output directory (default: ./reports)
  --mobile           Include mobile-specific testing
  --screenshots      Include full-page screenshots
  --verbose          Detailed console output

Examples:
  npm run full-analysis https://example.com
  npm run full-analysis http://localhost:3000 --format json
  npm run full-analysis https://staging.example.com --output ./audit-reports
    `);
    process.exit(1);
  }
  
  // Parse command line options
  const options = {
    format: getOption('--format', 'html'),
    outputDir: getOption('--output', './reports'),
    includeMobile: args.includes('--mobile'),
    includeScreenshots: args.includes('--screenshots'),
    verbose: args.includes('--verbose')
  };
  
  console.log(`
🚀 Starting Full UX Analysis
=============================
📍 URL: ${url}
📊 Format: ${options.format}
📂 Output: ${options.outputDir}
📱 Mobile Testing: ${options.includeMobile ? 'Enabled' : 'Standard'}
📸 Screenshots: ${options.includeScreenshots ? 'Enabled' : 'Standard'}
`);
  
  const orchestrator = new UXOrchestrator({
    outputDir: options.outputDir,
    screenshotDir: path.join(options.outputDir, 'screenshots'),
    timeout: 60000, // Extended timeout for full analysis
    verbose: options.verbose
  });
  
  try {
    await orchestrator.initialize();
    
    console.log('🔍 Running comprehensive analysis...');
    console.log('⏱️  This may take 30-90 seconds depending on page complexity');
    
    const startTime = Date.now();
    
    // Run full analysis
    const results = await orchestrator.analyzePage(url, 'full', {
      includeMobile: options.includeMobile,
      includeScreenshots: options.includeScreenshots
    });
    
    const analysisTime = Date.now() - startTime;
    
    // Display comprehensive results
    displayFullResults(results, analysisTime, options.verbose);
    
    // Generate detailed report
    console.log(`\n📝 Generating ${options.format} report...`);
    const reportPath = await orchestrator.generateReport(results, options.format);
    
    console.log(`\n✅ Full analysis complete!`);
    console.log(`📁 Report saved to: ${reportPath}`);
    
    if (options.includeScreenshots && results.screenshots.length > 0) {
      console.log(`📸 Screenshots saved to: ${path.dirname(results.screenshots[0])}`);
    }
    
    // Provide actionable next steps
    displayActionableInsights(results);
    
  } catch (error) {
    console.error(`❌ Full analysis failed: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await orchestrator.close();
  }
}

function getOption(flag, defaultValue) {
  const args = process.argv.slice(2);
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : defaultValue;
}

function displayFullResults(results, analysisTime, verbose) {
  console.log(`\n🎯 FULL ANALYSIS RESULTS`);
  console.log(`========================`);
  console.log(`⏱️  Analysis Time: ${Math.round(analysisTime / 1000)}s`);
  console.log(`🔍 URL Analyzed: ${results.url}`);
  console.log(`📅 Timestamp: ${new Date(results.timestamp).toLocaleString()}`);
  
  // Summary metrics
  console.log(`\n📊 SUMMARY METRICS`);
  console.log(`==================`);
  console.log(`📈 Overall Score: ${results.summary.overallScore}/100`);
  console.log(`🚨 Critical Issues: ${results.summary.criticalIssues}`);
  console.log(`🔴 High Priority: ${results.summary.highIssues}`);
  console.log(`🟡 Medium Priority: ${results.summary.mediumIssues}`);
  console.log(`💡 Total Recommendations: ${results.summary.recommendations}`);
  console.log(`⚡ Quick Wins Available: ${results.summary.quickWins}`);
  console.log(`⏱️  Estimated Fix Time: ${Math.round(results.summary.estimatedFixTime / 60)} hours`);
  
  // Performance metrics
  if (results.metrics.performance) {
    console.log(`\n⚡ PERFORMANCE METRICS`);
    console.log(`=====================`);
    const perf = results.metrics.performance;
    if (perf.loadTime) console.log(`📊 Page Load Time: ${perf.loadTime}ms`);
    if (perf.domContentLoaded) console.log(`🏗️  DOM Ready: ${perf.domContentLoaded}ms`);
    if (perf.firstContentfulPaint) console.log(`🎨 First Paint: ${perf.firstContentfulPaint}ms`);
    if (perf.largestContentfulPaint) console.log(`🖼️  LCP: ${perf.largestContentfulPaint}ms`);
  }
  
  // Accessibility scores
  if (results.scores.accessibility) {
    console.log(`\n♿ ACCESSIBILITY SCORE`);
    console.log(`=====================`);
    console.log(`📊 Score: ${results.scores.accessibility}/100`);
  }
  
  // Priority actions
  if (results.summary.priorityActions && results.summary.priorityActions.length > 0) {
    console.log(`\n🔥 PRIORITY ACTIONS`);
    console.log(`==================`);
    results.summary.priorityActions.forEach((action, i) => {
      console.log(`${i + 1}. ${action.title}`);
      console.log(`   Impact: ${action.impact}`);
      console.log(`   Action: ${action.action}`);
      console.log('');
    });
  }
  
  // Detailed issues (if verbose)
  if (verbose && results.issues.length > 0) {
    console.log(`\n🔍 DETAILED ISSUES`);
    console.log(`==================`);
    
    const criticalIssues = results.issues.filter(i => i.severity === 'critical' || i.impact === 'high');
    const highIssues = results.issues.filter(i => i.severity === 'high' || i.impact === 'medium');
    
    if (criticalIssues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES (${criticalIssues.length})`);
      criticalIssues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.title || issue.message}`);
        if (issue.description) console.log(`   ${issue.description}`);
        if (issue.fix || issue.solution) console.log(`   Fix: ${issue.fix || issue.solution}`);
        console.log('');
      });
    }
    
    if (highIssues.length > 0) {
      console.log(`\n🔴 HIGH PRIORITY ISSUES (${highIssues.length})`);
      highIssues.slice(0, 5).forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.title || issue.message}`);
        if (issue.fix || issue.solution) console.log(`   Fix: ${issue.fix || issue.solution}`);
        console.log('');
      });
      
      if (highIssues.length > 5) {
        console.log(`   ... and ${highIssues.length - 5} more high priority issues`);
      }
    }
  }
}

function displayActionableInsights(results) {
  console.log(`\n💡 ACTIONABLE INSIGHTS`);
  console.log(`=====================`);
  
  // Development workflow recommendations
  const insights = [];
  
  if (results.summary.criticalIssues > 0) {
    insights.push(`🚨 URGENT: Fix ${results.summary.criticalIssues} critical issues before deployment`);
  }
  
  if (results.summary.quickWins > 0) {
    insights.push(`⚡ QUICK WINS: ${results.summary.quickWins} easy improvements available (< 30 min each)`);
  }
  
  if (results.metrics.performance?.loadTime > 3000) {
    insights.push(`🐌 PERFORMANCE: Page loads in ${Math.round(results.metrics.performance.loadTime / 1000)}s - optimize for better user experience`);
  }
  
  if (results.scores?.accessibility < 80) {
    insights.push(`♿ ACCESSIBILITY: Score ${results.scores.accessibility}/100 - improve for better inclusive design`);
  }
  
  if (results.summary.estimatedFixTime > 480) { // 8 hours
    insights.push(`⏱️  PLANNING: ${Math.round(results.summary.estimatedFixTime / 60)} hours of work identified - consider sprint planning`);
  }
  
  if (insights.length === 0) {
    insights.push(`✅ EXCELLENT: No major issues found! Consider running periodic checks to maintain quality`);
  }
  
  insights.forEach((insight, i) => {
    console.log(`${i + 1}. ${insight}`);
  });
  
  // Next steps recommendations
  console.log(`\n📋 RECOMMENDED NEXT STEPS`);
  console.log(`=========================`);
  console.log(`1. 📖 Review the detailed report for specific implementation guidance`);
  console.log(`2. 🎯 Start with critical issues and quick wins for maximum impact`);
  console.log(`3. 📊 Run 'npm run quick <url>' after fixes to verify improvements`);
  console.log(`4. 🔄 Schedule regular analysis to maintain UX quality`);
  
  if (results.summary.criticalIssues === 0 && results.summary.highIssues === 0) {
    console.log(`5. 🚀 Consider advanced optimization: performance tuning, advanced accessibility features`);
  }
}

// Run the full analysis
if (require.main === module) {
  runFullAnalysis().catch(error => {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runFullAnalysis };