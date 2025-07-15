#!/usr/bin/env node

/**
 * Claude UX Consultant Demo
 * Interactive demonstration of the UX analysis capabilities
 */

const UXOrchestrator = require('../src/orchestrator');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

async function runDemo() {
  console.log(chalk.blue('🚀 Claude UX Consultant Demo'));
  console.log(chalk.gray('========================================'));
  
  const orchestrator = new UXOrchestrator({
    outputDir: './demo-reports',
    screenshotDir: './demo-screenshots'
  });
  
  try {
    await orchestrator.initialize();
    
    // Demo sites with different types of issues
    const demoSites = [
      {
        url: 'https://example.com',
        name: 'Example.com',
        description: 'Basic HTML page - good for testing fundamentals',
        expectedIssues: 'Minimal issues, good baseline'
      },
      {
        url: 'https://httpbin.org/html',
        name: 'HTTPBin HTML',
        description: 'Simple HTML test page',
        expectedIssues: 'Basic HTML structure issues'
      },
      {
        url: 'https://jsonplaceholder.typicode.com',
        name: 'JSONPlaceholder',
        description: 'API documentation site',
        expectedIssues: 'Performance and accessibility opportunities'
      }
    ];
    
    console.log(chalk.yellow('\\n🎯 Running Analysis on Demo Sites:'));
    
    const results = [];
    
    for (let i = 0; i < demoSites.length; i++) {
      const site = demoSites[i];
      console.log(chalk.blue(`\\n[${i + 1}/${demoSites.length}] ${site.name}`));
      console.log(chalk.gray(`URL: ${site.url}`));
      console.log(chalk.gray(`Description: ${site.description}`));
      
      try {
        // Run quick analysis
        console.log(chalk.yellow('  🔍 Running quick analysis...'));
        const quickResult = await orchestrator.analyzePage(site.url, 'quick');
        
        console.log(chalk.green('  ✅ Quick analysis complete'));
        console.log(chalk.white(`     Issues: ${quickResult.summary.totalIssues}`));
        console.log(chalk.white(`     Critical: ${quickResult.summary.criticalIssues}`));
        console.log(chalk.white(`     Score: ${quickResult.summary.overallScore}/100`));
        
        // Run deep analysis for first site
        if (i === 0) {
          console.log(chalk.yellow('  🔬 Running deep analysis (demo)...'));
          const deepResult = await orchestrator.analyzePage(site.url, 'deep');
          
          console.log(chalk.green('  ✅ Deep analysis complete'));
          console.log(chalk.white(`     Total Issues: ${deepResult.summary.totalIssues}`));
          console.log(chalk.white(`     Recommendations: ${deepResult.summary.recommendations}`));
          
          results.push({ ...site, quickResult, deepResult });
        } else {
          results.push({ ...site, quickResult });
        }
        
      } catch (error) {
        console.log(chalk.red(`  ❌ Failed to analyze ${site.name}: ${error.message}`));
        results.push({ ...site, error: error.message });
      }
    }
    
    // Generate demo report
    console.log(chalk.blue('\\n📊 Generating Demo Report...'));
    
    const demoReport = {
      title: 'Claude UX Consultant Demo Report',
      timestamp: new Date().toISOString(),
      summary: {
        totalSites: demoSites.length,
        successfulAnalyses: results.filter(r => !r.error).length,
        failedAnalyses: results.filter(r => r.error).length,
        totalIssuesFound: results.reduce((sum, r) => sum + (r.quickResult?.summary?.totalIssues || 0), 0),
        averageScore: Math.round(results.reduce((sum, r) => sum + (r.quickResult?.summary?.overallScore || 0), 0) / results.length)
      },
      results,
      capabilities: {
        'Quick Analysis': '5-second immediate feedback',
        'Deep Analysis': 'Comprehensive UX audit',
        'Element Analysis': 'Component-specific testing',
        'Accessibility': 'WCAG 2.1 compliance checking',
        'Performance': 'Core Web Vitals monitoring',
        'Bug Detection': 'Automated issue discovery',
        'Mobile Testing': 'Responsive design validation'
      }
    };
    
    const reportPath = path.join('./demo-reports', 'demo-report.json');
    await fs.writeFile(reportPath, JSON.stringify(demoReport, null, 2));
    
    // Display summary
    console.log(chalk.green('\\n🎉 Demo Complete!'));
    console.log(chalk.gray('=================='));
    console.log(chalk.white(`Sites analyzed: ${demoReport.summary.totalSites}`));
    console.log(chalk.white(`Successful analyses: ${demoReport.summary.successfulAnalyses}`));
    console.log(chalk.white(`Total issues found: ${demoReport.summary.totalIssuesFound}`));
    console.log(chalk.white(`Average UX score: ${demoReport.summary.averageScore}/100`));
    
    console.log(chalk.yellow('\\n📁 Demo Files Generated:'));
    console.log(chalk.blue(`  Report: ${reportPath}`));
    console.log(chalk.blue(`  Screenshots: ./demo-screenshots/`));
    
    console.log(chalk.yellow('\\n🚀 Next Steps:'));
    console.log(chalk.white('  1. Try analyzing your own site:'));
    console.log(chalk.blue('     npm run quick http://localhost:3000'));
    console.log(chalk.white('  2. Run comprehensive analysis:'));
    console.log(chalk.blue('     npm run deep https://your-site.com'));
    console.log(chalk.white('  3. Set up monitoring:'));
    console.log(chalk.blue('     npm run monitor https://your-site.com'));
    
    console.log(chalk.yellow('\\n🎯 Key Features Demonstrated:'));
    Object.entries(demoReport.capabilities).forEach(([feature, description]) => {
      console.log(chalk.white(`  • ${feature}: ${description}`));
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Demo error:', error.message));
    process.exit(1);
  } finally {
    await orchestrator.close();
  }
}

// Interactive demo mode
async function runInteractiveDemo() {
  const inquirer = require('inquirer');
  
  console.log(chalk.blue('🎮 Interactive Demo Mode'));
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to demo?',
      choices: [
        { name: '⚡ Quick Analysis (5-second feedback)', value: 'quick' },
        { name: '🔬 Deep Analysis (comprehensive audit)', value: 'deep' },
        { name: '🎯 Element Analysis (component testing)', value: 'element' },
        { name: '🚀 Full Demo (all features)', value: 'full' },
        { name: '🔄 Monitor Demo (continuous tracking)', value: 'monitor' }
      ]
    }
  ]);
  
  const { url } = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter URL to analyze:',
      default: 'https://example.com',
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      }
    }
  ]);
  
  const orchestrator = new UXOrchestrator({
    outputDir: './interactive-demo-reports'
  });
  
  try {
    await orchestrator.initialize();
    
    console.log(chalk.blue(`\\n🔍 Running ${action} analysis on ${url}...`));
    
    let result;
    switch (action) {
      case 'quick':
        result = await orchestrator.analyzePage(url, 'quick');
        break;
      case 'deep':
        result = await orchestrator.analyzePage(url, 'deep');
        break;
      case 'element':
        const { selector } = await inquirer.prompt([
          {
            type: 'input',
            name: 'selector',
            message: 'Enter CSS selector to analyze:',
            default: 'button'
          }
        ]);
        result = await orchestrator.analyzePage(url, 'element', { selector });
        break;
      case 'full':
        result = await orchestrator.analyzePage(url, 'full');
        break;
      case 'monitor':
        console.log(chalk.yellow('Monitor mode - analyzing every 30 seconds...'));
        console.log(chalk.gray('Press Ctrl+C to stop'));
        
        const monitor = async () => {
          const monitorResult = await orchestrator.analyzePage(url, 'quick');
          console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] Issues: ${monitorResult.summary.totalIssues} | Score: ${monitorResult.summary.overallScore}/100`));
        };
        
        await monitor();
        setInterval(monitor, 30000);
        return;
    }
    
    // Display results
    orchestrator.displayImmediateFeedback(result);
    
    // Generate report
    const reportPath = await orchestrator.generateReport(result, 'html');
    console.log(chalk.green(`\\n📁 Report generated: ${reportPath}`));
    
    // Ask if user wants to continue
    const { continue: shouldContinue } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Run another analysis?',
        default: false
      }
    ]);
    
    if (shouldContinue) {
      await runInteractiveDemo();
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Interactive demo error:', error.message));
  } finally {
    await orchestrator.close();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    await runInteractiveDemo();
  } else {
    await runDemo();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runDemo, runInteractiveDemo };