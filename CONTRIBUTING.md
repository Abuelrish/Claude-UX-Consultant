# 🤝 Contributing to Claude UX Consultant

Thank you for your interest in contributing to Claude UX Consultant! This guide will help you get started.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/your-username/Claude-UX-Consultant.git`
3. **Install dependencies**: `npm install`
4. **Run tests**: `npm test`
5. **Make your changes**
6. **Submit a pull request**

## 🎯 How to Contribute

### 🐛 Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/Abuelrish/Claude-UX-Consultant/issues) to avoid duplicates.

**Bug Report Template:**
```markdown
**Bug Description:**
A clear description of what the bug is.

**To Reproduce:**
Steps to reproduce the behavior:
1. Run command '...'
2. Navigate to '...'
3. See error

**Expected Behavior:**
What you expected to happen.

**Screenshots:**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10, macOS 11.0]
- Node.js version: [e.g. 16.14.0]
- Claude UX Consultant version: [e.g. 1.0.0]
```

### 💡 Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** in issues
2. **Describe the problem** your feature would solve
3. **Explain your proposed solution**
4. **Consider implementation complexity**

**Feature Request Template:**
```markdown
**Feature Description:**
A clear description of the feature you'd like to see.

**Problem Statement:**
What problem does this feature solve?

**Proposed Solution:**
How would you like this feature to work?

**Alternatives Considered:**
Any alternative solutions you've considered.

**Additional Context:**
Any other context or screenshots about the feature.
```

### 🔧 Code Contributions

#### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/Abuelrish/Claude-UX-Consultant.git
cd Claude-UX-Consultant

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run setup
npm run setup

# Run tests
npm test

# Run demo to verify setup
npm run demo
```

#### Making Changes

1. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Follow our coding standards**:
   - Use consistent indentation (2 spaces)
   - Add JSDoc comments for functions
   - Follow existing code patterns
   - Include error handling

3. **Write tests** for new features:
   ```javascript
   // tests/analyzers/accessibility.test.js
   const AccessibilityAnalyzer = require('../../src/analyzers/accessibility');
   
   describe('AccessibilityAnalyzer', () => {
     test('should detect missing alt text', async () => {
       // Test implementation
     });
   });
   ```

4. **Update documentation** if needed:
   - Update README.md for new features
   - Add/update JSDoc comments
   - Update CLAUDE.md for Claude Code integration

#### Code Style Guidelines

**JavaScript/Node.js:**
```javascript
// Good: Clear function names with JSDoc
/**
 * Analyzes accessibility issues on a page
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeAccessibility(page) {
  const results = {
    issues: [],
    recommendations: []
  };
  
  // Implementation
  return results;
}

// Good: Consistent error handling
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error.message);
  throw new Error(`Failed to complete operation: ${error.message}`);
}
```

**File Organization:**
- Keep files focused on single responsibilities
- Use descriptive file names
- Group related functionality in directories
- Follow existing project structure

### 🧪 Testing

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/analyzers/accessibility.test.js

# Run tests with coverage
npm run test:coverage
```

#### Writing Tests
```javascript
// Example test structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });
  
  afterEach(() => {
    // Cleanup after each test
  });
  
  test('should handle normal case', async () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = await componentFunction(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.issues).toHaveLength(0);
  });
  
  test('should handle error case', async () => {
    // Test error scenarios
  });
});
```

### 📝 Documentation

#### Types of Documentation

1. **Code Comments**: Explain complex logic
2. **JSDoc**: Document function parameters and return values
3. **README Updates**: For new features or usage changes
4. **User Guide**: For significant user-facing changes
5. **API Documentation**: For new endpoints or methods

#### Documentation Style

```javascript
/**
 * Performs comprehensive UX analysis on a web page
 * 
 * @param {string} url - The URL to analyze
 * @param {string} analysisType - Type of analysis (quick, deep, full)
 * @param {Object} options - Analysis options
 * @param {string} [options.selector] - CSS selector for element analysis
 * @param {number} [options.timeout] - Timeout in milliseconds
 * @returns {Promise<AnalysisResult>} Comprehensive analysis results
 * 
 * @example
 * const result = await orchestrator.analyzePage('https://example.com', 'quick');
 * console.log(`Found ${result.issues.length} issues`);
 */
```

## 🏗️ Architecture

### Project Structure
```
src/
├── orchestrator.js          # Main coordination logic
├── analyzers/              # Individual analysis modules
│   ├── accessibility.js   # WCAG compliance checking
│   ├── performance.js      # Performance metrics
│   ├── visual.js          # Visual design analysis
│   ├── mobile.js          # Mobile responsiveness
│   └── bug-detector.js    # Bug detection
├── reporters/              # Report generation
│   ├── html-reporter.js   # HTML dashboard reports
│   ├── json-reporter.js   # API-friendly output
│   └── markdown-reporter.js # Developer documentation
└── utils/                  # Shared utilities
```

### Adding New Analyzers

1. **Create analyzer file** in `src/analyzers/`
2. **Implement required methods**:
   ```javascript
   class NewAnalyzer {
     async quickAnalysis(page) {
       // 5-second analysis
     }
     
     async comprehensiveAnalysis(page) {
       // Detailed analysis
     }
   }
   ```
3. **Register in orchestrator**
4. **Add tests**
5. **Update documentation**

### Adding New Reporters

1. **Create reporter file** in `src/reporters/`
2. **Implement generate method**:
   ```javascript
   class NewReporter {
     async generate(analysisResults, options) {
       // Generate report
       return reportPath;
     }
   }
   ```
3. **Add to orchestrator**
4. **Add CLI support**
5. **Write tests**

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure tests pass**: `npm test`
2. **Run linting**: `npm run lint`
3. **Update documentation** if needed
4. **Add yourself to contributors** (optional)

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix/feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes documented)
```

### Review Process

1. **Automated checks** run (tests, linting)
2. **Code review** by maintainers
3. **Feedback addressed** if needed
4. **Approval and merge**

## 🎯 Development Guidelines

### Analyzer Development

```javascript
// Good: Consistent result structure
return {
  issues: [
    {
      type: 'accessibility',
      severity: 'high',
      title: 'Missing Alt Text',
      description: '5 images missing alt attributes',
      fix: 'Add descriptive alt text to images',
      wcag: '1.1.1'
    }
  ],
  recommendations: [
    {
      type: 'accessibility',
      category: 'images',
      title: 'Optimize Image Alt Text',
      description: 'Consider more descriptive alt text',
      suggestion: 'Use specific descriptions instead of generic terms'
    }
  ],
  metrics: {
    totalImages: 10,
    imagesWithAlt: 5
  }
};
```

### Error Handling

```javascript
// Good: Graceful error handling
try {
  const results = await page.evaluate(() => {
    // Analysis code
  });
  return results;
} catch (error) {
  console.error('Analysis failed:', error.message);
  return {
    issues: [{
      type: 'system',
      severity: 'medium',
      title: 'Analysis Error',
      description: `Analysis failed: ${error.message}`,
      fix: 'Check page accessibility or try again'
    }],
    recommendations: [],
    metrics: {}
  };
}
```

### Performance Considerations

1. **Optimize analysis time** - Target 5 seconds for quick analysis
2. **Minimize memory usage** - Clean up resources properly
3. **Handle timeouts gracefully** - Provide partial results when possible
4. **Batch operations** - Group similar checks together

## 🏷️ Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

### Release Checklist
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Create release tag
5. Publish to npm
6. Update documentation

## 🌟 Recognition

Contributors will be:
- **Listed in README** contributors section
- **Credited in release notes** for significant contributions
- **Invited to maintainer team** for ongoing contributors

## 📞 Getting Help

- **Questions**: Open a [discussion](https://github.com/Abuelrish/Claude-UX-Consultant/discussions)
- **Bugs**: Create an [issue](https://github.com/Abuelrish/Claude-UX-Consultant/issues)
- **Security**: Email security@example.com (private disclosure)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you're expected to uphold this code.

---

**Thank you for contributing to Claude UX Consultant!** 🎉

Your contributions help make the web more accessible and user-friendly for everyone.