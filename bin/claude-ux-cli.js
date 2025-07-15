#!/usr/bin/env node

/**
 * Claude UX Consultant CLI
 * Command-line interface for the UX analysis tool
 */

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs').promises;
const UXOrchestrator = require('../src/orchestrator');

// Configure CLI
program
  .name('claude-ux')
  .description('🎯 Claude UX Consultant - AI-Powered UX Analysis Tool')
  .version('1.0.0');

// Quick analysis command
program
  .command('quick <url>')
  .description('Quick 5-second analysis for immediate feedback')
  .option('-o, --output <path>', 'Output directory for reports')
  .option('-f, --format <format>', 'Report format (html, json, markdown)', 'html')
  .option('--no-screenshots', 'Skip screenshot capture')
  .action(async (url, options) => {
    try {
      console.log(chalk.blue('🎯 Starting quick UX analysis...'));
      
      const orchestrator = new UXOrchestrator({
        outputDir: options.output || './reports',
        captureScreenshots: options.screenshots !== false
      });
      
      await orchestrator.initialize();
      const results = await orchestrator.analyzePage(url, 'quick');
      
      orchestrator.displayImmediateFeedback(results);
      
      if (options.format) {
        const reportPath = await orchestrator.generateReport(results, options.format);
        console.log(chalk.green(`\\n📁 Report generated: ${reportPath}`));
      }
      
      await orchestrator.close();
      
      // Exit with error code if critical issues found
      if (results.summary.criticalIssues > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

// Deep analysis command
program
  .command('deep <url>')
  .description('Comprehensive UX analysis with detailed insights')
  .option('-o, --output <path>', 'Output directory for reports')
  .option('-f, --format <format>', 'Report format (html, json, markdown)', 'html')
  .option('--mobile', 'Include mobile analysis')
  .action(async (url, options) => {
    try {
      console.log(chalk.blue('🔬 Starting deep UX analysis...'));
      
      const orchestrator = new UXOrchestrator({
        outputDir: options.output || './reports'
      });
      
      await orchestrator.initialize();
      
      const analysisType = options.mobile ? 'full' : 'deep';
      const results = await orchestrator.analyzePage(url, analysisType);
      
      orchestrator.displayImmediateFeedback(results);
      
      const reportPath = await orchestrator.generateReport(results, options.format);
      console.log(chalk.green(`\\n📁 Comprehensive report: ${reportPath}`));
      
      await orchestrator.close();
      
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

// Element analysis command
program
  .command('element <url> <selector>')
  .description('Analyze specific UI elements')
  .option('-o, --output <path>', 'Output directory for reports')
  .action(async (url, selector, options) => {
    try {
      console.log(chalk.blue(`🎯 Analyzing element: ${selector}`));
      
      const orchestrator = new UXOrchestrator({
        outputDir: options.output || './reports'
      });
      
      await orchestrator.initialize();
      const results = await orchestrator.analyzePage(url, 'element', { selector });
      
      orchestrator.displayImmediateFeedback(results);
      
      await orchestrator.close();
      
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

// Batch analysis command
program
  .command('batch <config>')
  .description('Batch analysis of multiple pages')
  .option('-o, --output <path>', 'Output directory for reports')
  .action(async (configPath, options) => {
    try {
      console.log(chalk.blue('📋 Starting batch analysis...'));
      
      const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
      const orchestrator = new UXOrchestrator({
        outputDir: options.output || './reports'
      });
      
      await orchestrator.initialize();
      
      const results = [];
      
      for (const page of config.pages) {
        console.log(chalk.yellow(`Analyzing: ${page.url}`));
        const result = await orchestrator.analyzePage(page.url, page.type || 'quick');
        results.push(result);
      }
      
      // Generate summary report
      const summaryReport = {
        timestamp: new Date().toISOString(),
        totalPages: results.length,
        totalIssues: results.reduce((sum, r) => sum + r.summary.totalIssues, 0),
        criticalIssues: results.reduce((sum, r) => sum + r.summary.criticalIssues, 0),
        results
      };
      
      const summaryPath = path.join(options.output || './reports', 'batch-summary.json');
      await fs.writeFile(summaryPath, JSON.stringify(summaryReport, null, 2));
      
      console.log(chalk.green(`\\n📊 Batch analysis complete!`));
      console.log(chalk.green(`📁 Summary report: ${summaryPath}`));
      
      await orchestrator.close();
      
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

// Monitor command
program
  .command('monitor <url>')
  .description('Continuous monitoring of UX metrics')
  .option('-i, --interval <seconds>', 'Monitoring interval in seconds', '300')
  .option('-o, --output <path>', 'Output directory for reports')
  .action(async (url, options) => {
    try {
      console.log(chalk.blue('🔄 Starting continuous monitoring...'));
      
      const orchestrator = new UXOrchestrator({
        outputDir: options.output || './reports'
      });
      
      await orchestrator.initialize();
      
      const interval = parseInt(options.interval) * 1000;
      
      console.log(chalk.yellow(`Monitoring ${url} every ${options.interval} seconds`));
      console.log(chalk.gray('Press Ctrl+C to stop monitoring'));
      
      const monitor = async () => {
        try {
          const results = await orchestrator.analyzePage(url, 'quick');
          
          const timestamp = new Date().toLocaleTimeString();
          const status = results.summary.criticalIssues > 0 ? 
            chalk.red('🚨 CRITICAL') : 
            results.summary.totalIssues > 0 ? 
              chalk.yellow('⚠️  ISSUES') : 
              chalk.green('✅ HEALTHY');
          
          console.log(`[${timestamp}] ${status} - ${results.summary.totalIssues} issues found`);
          
          if (results.summary.criticalIssues > 0) {
            console.log(chalk.red('Critical issues:'));
            results.summary.priorityActions.forEach(action => {
              console.log(chalk.red(`  • ${action.title}`));
            });
          }
          
        } catch (error) {
          console.error(chalk.red(`[${new Date().toLocaleTimeString()}] Monitor error: ${error.message}`));
        }
      };
      
      // Initial check
      await monitor();
      
      // Set up interval
      const intervalId = setInterval(monitor, interval);
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\\n🛑 Stopping monitor...'));
        clearInterval(intervalId);
        await orchestrator.close();
        process.exit(0);
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

// Interactive setup command
program
  .command('setup')
  .description('Interactive setup and configuration')
  .action(async () => {
    try {
      console.log(chalk.blue('🛠️  Claude UX Consultant Setup'));
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'baseUrl',
          message: 'Default base URL for analysis:',
          default: 'http://localhost:3000'
        },
        {
          type: 'input',
          name: 'outputDir',
          message: 'Default output directory:',
          default: './reports'
        },
        {
          type: 'checkbox',
          name: 'analysisTypes',
          message: 'Which analysis types to enable by default:',
          choices: [
            { name: 'Accessibility', value: 'accessibility', checked: true },
            { name: 'Performance', value: 'performance', checked: true },
            { name: 'Visual Design', value: 'visual', checked: true },
            { name: 'Mobile', value: 'mobile', checked: true },
            { name: 'Bug Detection', value: 'bugs', checked: true }
          ]
        },
        {
          type: 'list',
          name: 'reportFormat',
          message: 'Default report format:',
          choices: ['html', 'json', 'markdown'],
          default: 'html'
        }
      ]);
      
      const config = {
        baseUrl: answers.baseUrl,
        outputDir: answers.outputDir,
        analysis: answers.analysisTypes.reduce((acc, type) => {
          acc[type] = true;
          return acc;
        }, {}),
        reportFormat: answers.reportFormat,
        createdAt: new Date().toISOString()
      };
      
      await fs.writeFile('./claude-ux-config.json', JSON.stringify(config, null, 2));
      
      console.log(chalk.green('✅ Configuration saved to claude-ux-config.json'));
      console.log(chalk.yellow('\\nYou can now run:'));
      console.log(chalk.blue('  claude-ux quick <url>'));
      console.log(chalk.blue('  claude-ux deep <url>'));
      console.log(chalk.blue('  claude-ux monitor <url>'));
      
    } catch (error) {
      console.error(chalk.red('❌ Setup error:', error.message));
      process.exit(1);
    }
  });

// Demo command
program
  .command('demo')
  .description('Run demo analysis on example websites')
  .action(async () => {
    try {
      console.log(chalk.blue('🚀 Running Claude UX Consultant Demo'));
      
      const demoSites = [
        'https://example.com',
        'https://httpbin.org/html',
        'https://jsonplaceholder.typicode.com'
      ];
      
      const orchestrator = new UXOrchestrator();
      await orchestrator.initialize();
      
      for (const site of demoSites) {
        console.log(chalk.yellow(`\\n📊 Analyzing: ${site}`));
        
        try {
          const results = await orchestrator.analyzePage(site, 'quick');
          
          console.log(chalk.green(`✅ Analysis complete`));
          console.log(`Issues found: ${results.summary.totalIssues}`);
          console.log(`Critical issues: ${results.summary.criticalIssues}`);
          
        } catch (error) {
          console.log(chalk.red(`❌ Failed to analyze ${site}: ${error.message}`));
        }
      }
      
      await orchestrator.close();
      console.log(chalk.green('\\n🎉 Demo complete!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Demo error:', error.message));
      process.exit(1);
    }
  });

// Help command enhancement
program
  .command('help-extended')
  .description('Show extended help with examples')
  .action(() => {
    console.log(chalk.blue('🎯 Claude UX Consultant - Extended Help'));
    console.log(chalk.yellow('\\nQuick Start Examples:'));
    console.log('  claude-ux quick http://localhost:3000');
    console.log('  claude-ux deep https://example.com --format json');
    console.log('  claude-ux element http://localhost:3000 ".navbar"');
    console.log('  claude-ux monitor https://mysite.com --interval 60');
    
    console.log(chalk.yellow('\\nBatch Analysis:'));
    console.log('  claude-ux batch config.json');
    console.log('  # config.json: {"pages": [{"url": "http://localhost:3000", "type": "quick"}]}');
    
    console.log(chalk.yellow('\\nConfiguration:'));
    console.log('  claude-ux setup  # Interactive setup');
    console.log('  claude-ux demo   # Try with example sites');
    
    console.log(chalk.yellow('\\nReport Formats:'));
    console.log('  --format html      # Executive-friendly HTML dashboard');
    console.log('  --format json      # Machine-readable analysis data');
    console.log('  --format markdown  # Developer documentation');
    
    console.log(chalk.yellow('\\nTips:'));
    console.log('  • Use quick analysis during development');
    console.log('  • Use deep analysis before releases');
    console.log('  • Monitor production sites for regressions');
    console.log('  • Element analysis for component testing');
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.yellow('\\nTip: Run "claude-ux setup" for interactive configuration'));
  console.log(chalk.yellow('Or try "claude-ux demo" to see it in action'));
}