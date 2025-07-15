#!/usr/bin/env node

/**
 * Setup script for Claude UX Consultant
 * Handles initial configuration and dependency verification
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

async function checkDependencies() {
  console.log(chalk.blue('🔍 Checking dependencies...'));
  
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      throw new Error(`Node.js 16+ required, found ${nodeVersion}`);
    }
    
    console.log(chalk.green(`✅ Node.js ${nodeVersion} - OK`));
    
    // Check npm version
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(chalk.green(`✅ npm ${npmVersion} - OK`));
    
    // Check if Playwright is installed
    try {
      require('playwright');
      console.log(chalk.green('✅ Playwright - OK'));
    } catch (e) {
      console.log(chalk.yellow('⚠️  Playwright not found, installing...'));
      execSync('npm install playwright', { stdio: 'inherit' });
      console.log(chalk.green('✅ Playwright installed'));
    }
    
    // Install Playwright browsers
    console.log(chalk.yellow('📦 Installing Playwright browsers...'));
    execSync('npx playwright install', { stdio: 'inherit' });
    console.log(chalk.green('✅ Playwright browsers installed'));
    
  } catch (error) {
    console.error(chalk.red('❌ Dependency check failed:', error.message));
    process.exit(1);
  }
}

async function createDirectories() {
  console.log(chalk.blue('📁 Creating directories...'));
  
  const directories = [
    './reports',
    './screenshots',
    './config',
    './logs'
  ];
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(chalk.green(`✅ Created ${dir}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to create ${dir}:`, error.message));
    }
  }
}

async function createDefaultConfig() {
  console.log(chalk.blue('⚙️  Creating default configuration...'));
  
  const defaultConfig = {
    baseUrl: 'http://localhost:3000',
    outputDir: './reports',
    screenshotDir: './screenshots',
    timeout: 30000,
    viewport: {
      width: 1920,
      height: 1080
    },
    mobileViewport: {
      width: 375,
      height: 667
    },
    analysis: {
      accessibility: true,
      performance: true,
      visual: true,
      mobile: true,
      bugDetection: true
    },
    thresholds: {
      performance: {
        loadTime: 3000,
        domSize: 1500
      },
      accessibility: {
        contrastRatio: 4.5
      }
    },
    reporting: {
      defaultFormat: 'html',
      includeScreenshots: true,
      generateTrends: false
    }
  };
  
  try {
    await fs.writeFile('./config/default.json', JSON.stringify(defaultConfig, null, 2));
    console.log(chalk.green('✅ Default configuration created'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to create config:', error.message));
  }
}

async function createExampleFiles() {
  console.log(chalk.blue('📄 Creating example files...'));
  
  // Example batch configuration
  const exampleBatchConfig = {
    name: 'Example Batch Analysis',
    description: 'Analyze multiple pages of a website',
    baseUrl: 'https://example.com',
    pages: [
      {
        url: 'https://example.com',
        name: 'Homepage',
        type: 'deep'
      },
      {
        url: 'https://example.com/about',
        name: 'About Page',
        type: 'quick'
      },
      {
        url: 'https://example.com/contact',
        name: 'Contact Page',
        type: 'quick'
      }
    ],
    schedule: {
      enabled: false,
      interval: 'daily',
      time: '09:00'
    }
  };
  
  try {
    await fs.writeFile('./config/example-batch.json', JSON.stringify(exampleBatchConfig, null, 2));
    console.log(chalk.green('✅ Example batch configuration created'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to create example files:', error.message));
  }
  
  // Example CI/CD configuration
  const ciConfig = `# Claude UX Consultant CI/CD Integration
# GitHub Actions Example

name: UX Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  ux-analysis:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install Claude UX Consultant
      run: |
        npm install -g claude-ux-consultant
        
    - name: Run UX Analysis
      run: |
        claude-ux quick ${{ secrets.STAGING_URL }} --format json --output ./reports
        
    - name: Upload Reports
      uses: actions/upload-artifact@v3
      with:
        name: ux-reports
        path: ./reports/
        
    - name: Quality Gate
      run: |
        # Fail if critical issues found
        node -e "
          const report = require('./reports/ux-analysis-*.json');
          if (report.summary.criticalIssues > 0) {
            console.error('Critical UX issues found:', report.summary.criticalIssues);
            process.exit(1);
          }
        "
`;
  
  try {
    await fs.writeFile('./config/github-actions.yml', ciConfig);
    console.log(chalk.green('✅ CI/CD example created'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to create CI/CD config:', error.message));
  }
}

async function displaySetupComplete() {
  console.log(chalk.green('\\n🎉 Setup Complete!'));
  console.log(chalk.gray('=================='));
  
  console.log(chalk.yellow('\\n📁 Files Created:'));
  console.log(chalk.blue('  ./config/default.json - Default configuration'));
  console.log(chalk.blue('  ./config/example-batch.json - Batch analysis example'));
  console.log(chalk.blue('  ./config/github-actions.yml - CI/CD integration'));
  console.log(chalk.blue('  ./reports/ - Analysis reports directory'));
  console.log(chalk.blue('  ./screenshots/ - Screenshots directory'));
  
  console.log(chalk.yellow('\\n🚀 Quick Start:'));
  console.log(chalk.blue('  npm run quick http://localhost:3000'));
  console.log(chalk.blue('  npm run deep https://example.com'));
  console.log(chalk.blue('  npm run demo'));
  
  console.log(chalk.yellow('\\n🎯 CLI Usage:'));
  console.log(chalk.blue('  claude-ux quick <url>'));
  console.log(chalk.blue('  claude-ux deep <url> --format json'));
  console.log(chalk.blue('  claude-ux element <url> "button"'));
  console.log(chalk.blue('  claude-ux monitor <url> --interval 60'));
  
  console.log(chalk.yellow('\\n📚 Documentation:'));
  console.log(chalk.blue('  README.md - Complete usage guide'));
  console.log(chalk.blue('  CLAUDE.md - Claude Code integration'));
  console.log(chalk.blue('  ./docs/ - Additional documentation'));
  
  console.log(chalk.yellow('\\n💡 Tips:'));
  console.log(chalk.white('  • Use quick analysis during development'));
  console.log(chalk.white('  • Use deep analysis before releases'));
  console.log(chalk.white('  • Set up monitoring for production sites'));
  console.log(chalk.white('  • Integrate with CI/CD for automated quality checks'));
}

async function main() {
  console.log(chalk.blue('🛠️  Claude UX Consultant Setup'));
  console.log(chalk.gray('====================================='));
  
  try {
    await checkDependencies();
    await createDirectories();
    await createDefaultConfig();
    await createExampleFiles();
    await displaySetupComplete();
    
  } catch (error) {
    console.error(chalk.red('❌ Setup failed:', error.message));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };