# CLAUDE.md

This file provides guidance to Claude Code when working with the Claude UX Consultant project.

## Project Overview

Claude UX Consultant is a comprehensive AI-powered UX analysis and testing tool designed to provide immediate, actionable feedback on web application user experience. The tool combines automated browser testing with intelligent analysis to identify accessibility issues, performance bottlenecks, visual design problems, and usability concerns.

### Core Philosophy
- **Immediate Feedback**: Provide actionable insights in seconds, not hours
- **No External Dependencies**: Work completely offline without external AI APIs
- **Developer-Friendly**: Generate reports that developers can immediately act upon
- **Scalable Analysis**: From quick spot-checks to comprehensive audits

## Project Structure

```
Claude-UX-Consultant/
├── src/                          # Core analysis engines
│   ├── orchestrator.js          # Main orchestrator agent - coordinates all analysis
│   ├── analyzers/               # Individual analysis modules
│   │   ├── accessibility.js    # WCAG 2.1 compliance checking
│   │   ├── performance.js       # Core Web Vitals and performance metrics
│   │   ├── visual.js           # Visual design and layout analysis
│   │   ├── mobile.js           # Mobile responsiveness testing
│   │   └── bug-detector.js     # Automated bug discovery
│   ├── reporters/               # Report generation modules
│   │   ├── html-reporter.js    # Executive-friendly HTML reports
│   │   ├── json-reporter.js    # Machine-readable analysis output
│   │   ├── markdown-reporter.js # Developer documentation format
│   │   └── console-reporter.js # Real-time terminal output
│   └── utils/                   # Shared utilities and helpers
├── bin/                         # CLI executables
│   └── claude-ux-cli.js        # Command-line interface
├── examples/                    # Usage examples and demos
├── templates/                   # Report templates and configurations
├── docs/                        # Comprehensive documentation
├── scripts/                     # Setup and utility scripts
└── tests/                       # Test suite and validation
```

## Core Components

### 1. Orchestrator Agent (`src/orchestrator.js`)
The central coordination engine that:
- Manages browser automation with Playwright
- Coordinates multiple analysis types
- Provides immediate feedback (5-second quick analysis)
- Generates comprehensive reports
- Handles error recovery and timeouts

**Key Methods:**
- `analyzePage(url, type)` - Main analysis entry point
- `runQuickAnalysis()` - 5-second immediate feedback
- `runDeepAnalysis()` - Comprehensive audit
- `runElementAnalysis()` - Target specific components

### 2. Analysis Modules (`src/analyzers/`)

#### Accessibility Analyzer (`accessibility.js`)
- WCAG 2.1 compliance checking
- Missing alt text detection
- Form label validation
- Color contrast analysis
- Keyboard navigation testing
- Screen reader compatibility

#### Performance Analyzer (`performance.js`)
- Core Web Vitals measurement
- Page load time analysis
- DOM size optimization
- Image optimization opportunities
- JavaScript bundle analysis
- Network performance tracking

#### Visual Analyzer (`visual.js`)
- Layout consistency checking
- Typography hierarchy validation
- Color scheme analysis
- White space optimization
- Brand consistency verification
- Visual hierarchy assessment

#### Mobile Analyzer (`mobile.js`)
- Touch target sizing (44px minimum)
- Viewport responsiveness
- Mobile navigation usability
- Text readability on small screens
- Performance on mobile networks

#### Bug Detector (`bug-detector.js`)
- Broken image detection
- JavaScript console errors
- Network failure identification
- Form validation issues
- Navigation problems
- Missing assets

### 3. Reporting System (`src/reporters/`)

#### HTML Reporter (`html-reporter.js`)
Generates executive-friendly reports with:
- Visual dashboard with metrics
- Priority-ranked issue lists
- Before/after screenshots
- Implementation timelines
- Cost-benefit analysis

#### JSON Reporter (`json-reporter.js`)
Machine-readable output for:
- CI/CD integration
- API consumption
- Data analytics
- Automated workflows

#### Markdown Reporter (`markdown-reporter.js`)
Developer-focused documentation with:
- Detailed technical explanations
- Code examples and fixes
- Implementation guidelines
- Testing procedures

### 4. CLI Interface (`bin/claude-ux-cli.js`)
Command-line tool providing:
- Quick analysis commands
- Batch processing capabilities
- Configuration management
- Integration with CI/CD pipelines

## Analysis Types

### Quick Analysis (5 seconds)
**Purpose:** Immediate critical issue detection
**Use Case:** Development workflow integration, quick spot-checks
**Coverage:**
- Broken images and assets
- Missing accessibility attributes
- JavaScript console errors
- Basic performance metrics
- Critical usability issues

### Deep Analysis (30-60 seconds)
**Purpose:** Comprehensive UX audit
**Use Case:** Sprint planning, major releases, quarterly reviews
**Coverage:**
- Full accessibility compliance (WCAG 2.1)
- Detailed performance analysis
- Complete visual design review
- Mobile responsiveness testing
- SEO and metadata analysis

### Element Analysis (10-15 seconds)
**Purpose:** Component-specific testing
**Use Case:** Feature development, component library validation
**Coverage:**
- Specific CSS selector targeting
- Component accessibility testing
- Interactive element validation
- Form functionality checking

### Continuous Monitoring
**Purpose:** Real-time quality tracking
**Use Case:** Production monitoring, regression detection
**Coverage:**
- Scheduled analysis runs
- Performance trend tracking
- Issue alerting and notification
- Quality metric dashboards

## Development Workflows

### 1. Integration with Development Process
```bash
# Pre-commit hook
npm run quick http://localhost:3000

# Feature development
npm run element http://localhost:3000 ".new-component"

# Pre-deployment
npm run deep http://staging.example.com

# Production monitoring
npm run monitor http://production.example.com
```

### 2. CI/CD Integration
```yaml
# GitHub Actions example
- name: UX Analysis
  run: |
    npm install -g claude-ux-consultant
    claude-ux deep ${{ env.STAGING_URL }} --format json --output ./reports
    
- name: Quality Gate
  run: |
    # Fail build if critical issues found
    node scripts/quality-gate.js ./reports/analysis.json
```

### 3. Claude Code Integration
When working with Claude Code, the tool provides:
- **Automated Analysis Requests**: Claude can trigger analysis on specific pages/components
- **Contextual Recommendations**: AI-powered insights based on analysis results
- **Code Generation**: Specific fix implementations based on identified issues
- **Progress Tracking**: Automated re-analysis to verify fixes

## Configuration Patterns

### Basic Configuration (`config.json`)
```json
{
  "baseUrl": "http://localhost:3000",
  "pages": ["/", "/login", "/dashboard"],
  "analysis": {
    "accessibility": true,
    "performance": true,
    "visual": true,
    "mobile": true
  },
  "thresholds": {
    "loadTime": 3000,
    "contrastRatio": 4.5,
    "touchTargetSize": 44
  }
}
```

### Advanced Enterprise Configuration
```json
{
  "environments": {
    "development": "http://localhost:3000",
    "staging": "https://staging.example.com",
    "production": "https://example.com"
  },
  "analysis": {
    "accessibility": {
      "enabled": true,
      "level": "AAA",
      "includeWarnings": true
    },
    "performance": {
      "enabled": true,
      "budgets": {
        "loadTime": 2000,
        "domSize": 1000,
        "bundleSize": "500kb"
      }
    }
  },
  "reporting": {
    "formats": ["html", "json", "markdown"],
    "includeScreenshots": true,
    "generateTrends": true
  }
}
```

## Common Usage Patterns

### 1. Development Workflow Integration
```bash
# Quick check during development
npm run quick http://localhost:3000/new-feature

# Component-specific testing
npm run element http://localhost:3000 ".pricing-card"

# Pre-commit validation
npm run quick http://localhost:3000 --fail-on-critical
```

### 2. Quality Assurance Process
```bash
# Sprint completion review
npm run deep http://staging.example.com --output ./sprint-reports

# Release candidate validation
npm run full-analysis http://staging.example.com --comprehensive

# Production deployment verification
npm run quick http://production.example.com --monitor
```

### 3. Continuous Monitoring
```bash
# Production health monitoring
npm run monitor http://production.example.com --interval 300

# Performance trend tracking
npm run deep http://production.example.com --schedule daily

# Alert on critical issues
npm run quick http://production.example.com --alert-webhook $SLACK_URL
```

## Error Handling and Recovery

### Browser Automation Errors
- Automatic retry with exponential backoff
- Graceful degradation when features unavailable
- Alternative analysis methods for blocked content
- Comprehensive error logging and reporting

### Network and Connectivity Issues
- Configurable timeout handling
- Offline analysis capabilities
- Partial result generation
- Network condition simulation

### Analysis Failures
- Individual analyzer isolation
- Partial report generation
- Error context preservation
- Recovery recommendations

## Performance Optimization

### Browser Resource Management
- Efficient browser instance reuse
- Memory leak prevention
- Parallel analysis execution
- Resource cleanup procedures

### Analysis Efficiency
- Selective analysis execution
- Incremental analysis capabilities
- Caching for repeated analyses
- Optimized screenshot generation

## Security Considerations

### Data Privacy
- No external API calls for analysis
- Local screenshot and data storage
- Configurable data retention policies
- Secure credential handling

### Safe Analysis Practices
- Sandboxed browser execution
- Input validation and sanitization
- Safe navigation and interaction patterns
- Protection against malicious content

## Extensibility Framework

### Custom Analyzers
```javascript
// src/analyzers/custom-analyzer.js
class CustomAnalyzer {
  constructor(config) {
    this.config = config;
  }
  
  async analyze(page, context) {
    // Custom analysis logic
    return {
      issues: [],
      recommendations: [],
      metrics: {}
    };
  }
}
```

### Custom Reporters
```javascript
// src/reporters/custom-reporter.js
class CustomReporter {
  async generate(analysisResults, options) {
    // Custom report generation
    return {
      format: 'custom',
      content: '...',
      metadata: {}
    };
  }
}
```

### Plugin System
```javascript
// Register custom components
const orchestrator = new UXOrchestrator({
  analyzers: [CustomAnalyzer],
  reporters: [CustomReporter],
  middleware: [CustomMiddleware]
});
```

## Testing and Validation

### Unit Tests
- Individual analyzer testing
- Reporter output validation
- Utility function verification
- Configuration parsing tests

### Integration Tests
- End-to-end analysis workflows
- Browser automation validation
- Report generation testing
- CLI interface verification

### Performance Tests
- Analysis speed benchmarking
- Memory usage monitoring
- Scalability testing
- Resource optimization validation

## Deployment and Distribution

### NPM Package
- Global CLI installation
- Programmatic API usage
- Dependency management
- Version compatibility

### Docker Container
- Isolated execution environment
- Browser dependencies included
- Scalable deployment
- CI/CD integration

### Standalone Executable
- No Node.js requirement
- Self-contained analysis tool
- Cross-platform compatibility
- Enterprise deployment

## Monitoring and Analytics

### Usage Metrics
- Analysis execution frequency
- Most common issues found
- Performance trend tracking
- User adoption patterns

### Quality Metrics
- Issue detection accuracy
- False positive rates
- Analysis completion rates
- User satisfaction tracking

This tool is designed to be the definitive UX analysis solution for development teams, providing immediate actionable insights while integrating seamlessly with existing development workflows and Claude Code capabilities.