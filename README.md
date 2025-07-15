# 🎯 Claude UX Consultant

**AI-Powered UX Analysis & Testing Tool - Your 24/7 UX Consultant**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![GitHub Issues](https://img.shields.io/github/issues/Abuelrish/Claude-UX-Consultant.svg)](https://github.com/Abuelrish/Claude-UX-Consultant/issues)

> Automatically analyze your web applications for UX issues, accessibility problems, and performance bottlenecks using AI-powered analysis. Get immediate, actionable feedback without requiring external AI APIs.

## 🚀 Features

### 🔍 **Comprehensive Analysis**
- **Visual UI/UX Analysis** - AI-powered screenshot analysis
- **Accessibility Compliance** - WCAG 2.1 checking
- **Performance Monitoring** - Core Web Vitals tracking
- **Mobile Responsiveness** - Cross-device testing
- **Bug Detection** - Automated issue discovery

### ⚡ **Immediate Feedback**
- **5-Second Quick Analysis** - Instant critical issue detection
- **Deep Analysis** - Comprehensive UX audit
- **Element-Specific Testing** - Target specific components
- **Real-time Monitoring** - Continuous quality tracking

### 📊 **Professional Reporting**
- **Executive Summaries** - Stakeholder-friendly reports
- **Developer Backlogs** - Actionable tickets with story points
- **Visual Evidence** - Screenshot documentation
- **Priority Rankings** - Critical/High/Medium/Low classification

## 🛠️ Installation

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Abuelrish/Claude-UX-Consultant.git
cd Claude-UX-Consultant

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run setup (optional)
npm run setup

# Test your first analysis
npm run quick http://localhost:3000
```

### Global Installation
```bash
npm install -g claude-ux-consultant
claude-ux quick https://your-website.com
```

## 📖 Usage

### 🔥 Quick Commands

```bash
# Quick 5-second analysis
npm run quick http://localhost:3000

# Deep comprehensive analysis  
npm run deep http://localhost:3000/dashboard

# Element-specific analysis
npm run element http://localhost:3000 "button"

# Continuous monitoring (every 30 seconds)
npm run monitor http://localhost:3000

# Full analysis with reports
npm run full-analysis http://localhost:3000
```

### 🎯 Advanced Usage

```bash
# Analyze specific pages
npm run quick http://localhost:3000/login
npm run deep http://localhost:3000/checkout
npm run element http://localhost:3000/pricing ".pricing-card"

# Generate comprehensive reports
npm run full-analysis http://localhost:3000 --output ./reports

# Run demo on example sites
npm run demo
```

## 📋 What Gets Analyzed

### 🎨 **Visual Design**
- ✅ Layout consistency and alignment
- ✅ Color contrast and readability  
- ✅ Typography hierarchy and sizing
- ✅ White space and visual balance
- ✅ Brand consistency across pages

### 🔧 **Technical Issues**
- ✅ Broken images and missing assets
- ✅ JavaScript console errors
- ✅ Network failures and timeouts
- ✅ Form validation problems
- ✅ Navigation and routing issues

### ♿ **Accessibility**
- ✅ Missing alt text on images
- ✅ Form inputs without labels
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast compliance

### 📱 **Mobile & Responsive**
- ✅ Touch target sizing (44px minimum)
- ✅ Viewport and breakpoint behavior
- ✅ Text readability on mobile
- ✅ Navigation usability
- ✅ Performance on mobile networks

### ⚡ **Performance**
- ✅ Page load times
- ✅ DOM size and complexity
- ✅ Image optimization opportunities
- ✅ JavaScript bundle analysis
- ✅ Core Web Vitals tracking

## 📊 Sample Output

```bash
🎯 IMMEDIATE FEEDBACK:
========================
📊 Total Issues: 7
🚨 Critical Issues: 2
⚡ Quick Wins: 3
⏱️  Estimated Fix Time: 45 minutes

🔥 PRIORITY ACTIONS:
1. Fix Dashboard Routing: Users cannot access main app
2. Resolve Login Validation: Blocking user authentication  
3. Add Alt Text: 12 images missing accessibility attributes

📋 NEXT STEPS:
1. Fix 2 critical issues immediately
2. Address 3 medium priority issues this sprint
3. Implement 3 quick wins for easy improvements

📁 Full Report: ./reports/ux-analysis-2025-07-15.html
```

## 🎯 Integration with Claude Code

This tool is designed to work seamlessly with [Claude Code](https://claude.ai/code):

### 🤖 **Claude Integration**
1. **Automated Analysis** - Claude Code can run UX analysis automatically
2. **Report Generation** - AI-powered insights and recommendations
3. **Issue Prioritization** - Smart ranking of critical vs. nice-to-have fixes
4. **Code Suggestions** - Specific implementation guidance

### 📁 **Claude.md Configuration**
The included `CLAUDE.md` file provides Claude Code with:
- Understanding of your UX testing workflows
- Knowledge of common patterns and fixes
- Context about your application's architecture
- Automated testing and validation procedures

## 📂 Project Structure

```
Claude-UX-Consultant/
├── src/                          # Core analysis engines
│   ├── orchestrator.js          # Main orchestrator agent
│   ├── analyzers/               # Individual analysis modules
│   │   ├── accessibility.js    # A11y compliance checking
│   │   ├── performance.js       # Performance metrics
│   │   ├── visual.js           # Visual design analysis
│   │   └── mobile.js           # Mobile responsiveness
│   ├── reporters/               # Report generation
│   │   ├── html-reporter.js    # Executive HTML reports
│   │   ├── json-reporter.js    # Machine-readable output
│   │   └── markdown-reporter.js # Developer documentation
│   └── utils/                   # Shared utilities
├── bin/                         # CLI executables
├── examples/                    # Usage examples and demos
├── templates/                   # Report templates
├── docs/                        # Documentation
├── scripts/                     # Setup and utility scripts
├── tests/                       # Test suite
├── CLAUDE.md                    # Claude Code configuration
├── README.md                    # This file
└── package.json                 # Dependencies and scripts
```

## 🔧 Configuration

### Basic Configuration (`config.json`)
```json
{
  "baseUrl": "http://localhost:3000",
  "outputDir": "./reports",
  "screenshotDir": "./screenshots",
  "timeout": 30000,
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "mobileViewport": {
    "width": 375,
    "height": 667
  }
}
```

### Advanced Configuration
```json
{
  "analysis": {
    "accessibility": true,
    "performance": true,
    "visual": true,
    "mobile": true,
    "seo": true
  },
  "thresholds": {
    "performance": {
      "loadTime": 3000,
      "domSize": 1500
    },
    "accessibility": {
      "contrastRatio": 4.5
    }
  },
  "pages": [
    "/",
    "/login", 
    "/dashboard",
    "/checkout"
  ]
}
```

## 🎨 Customization

### Adding Custom Analyzers
```javascript
// src/analyzers/custom-analyzer.js
class CustomAnalyzer {
  async analyze(page) {
    // Your custom analysis logic
    return {
      issues: [],
      recommendations: []
    };
  }
}
```

### Custom Report Templates
```html
<!-- templates/custom-report.html -->
<h1>{{title}}</h1>
<div class="summary">
  {{#each issues}}
    <div class="issue {{severity}}">{{description}}</div>
  {{/each}}
</div>
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/Abuelrish/Claude-UX-Consultant.git
cd Claude-UX-Consultant
npm install
npm run test
```

### Adding New Features
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [📖 User Guide](docs/USER_GUIDE.md) - Complete usage documentation
- [🔧 API Reference](docs/API.md) - Programmatic usage
- [🎯 Best Practices](docs/BEST_PRACTICES.md) - UX analysis guidelines
- [🚀 Examples](examples/) - Real-world usage examples
- [❓ FAQ](docs/FAQ.md) - Frequently asked questions

## 🛟 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/Abuelrish/Claude-UX-Consultant/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Abuelrish/Claude-UX-Consultant/discussions)
- 📖 **Documentation**: [Full Documentation](docs/)
- 🎥 **Video Tutorials**: Coming soon!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Built with [Playwright](https://playwright.dev/) for browser automation
- Inspired by modern UX testing practices
- Designed for [Claude Code](https://claude.ai/code) integration
- Created for the developer and designer community

---

**Made with ❤️ by the Claude UX Team**

*Automatically analyze, monitor, and improve your web applications' user experience with AI-powered insights.*