# 🚀 Claude UX Consultant Installation Guide

## Quick Installation

### Prerequisites
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **npm 8+** - Comes with Node.js
- **Git** - For cloning the repository

### 1. Clone Repository
```bash
git clone https://github.com/Abuelrish/Claude-UX-Consultant.git
cd Claude-UX-Consultant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Playwright Browsers
```bash
npx playwright install
```

### 4. Run Setup (Optional)
```bash
npm run setup
```

### 5. Test Installation
```bash
# Quick test
npm run demo

# Test with your site
npm run quick http://localhost:3000
```

## Global Installation

### Install Globally
```bash
npm install -g claude-ux-consultant
```

### Use Anywhere
```bash
claude-ux quick https://example.com
claude-ux deep https://your-site.com --format html
claude-ux monitor https://production-site.com
```

## Docker Installation

### Build Docker Image
```bash
docker build -t claude-ux-consultant .
```

### Run in Container
```bash
docker run --rm -v $(pwd)/reports:/app/reports claude-ux-consultant quick https://example.com
```

## Development Installation

### For Contributors
```bash
git clone https://github.com/Abuelrish/Claude-UX-Consultant.git
cd Claude-UX-Consultant
npm install
npm run test
```

### Run Development Version
```bash
node src/orchestrator.js quick http://localhost:3000
```

## Configuration

### Create Config File
```bash
# Interactive setup
npm run setup

# Manual configuration
cp config/example.json config/default.json
# Edit config/default.json with your settings
```

### Environment Variables
```bash
# Optional: Set default base URL
export CLAUDE_UX_BASE_URL=http://localhost:3000

# Optional: Set output directory
export CLAUDE_UX_OUTPUT_DIR=./my-reports
```

## Verification

### Test Commands
```bash
# Version check
claude-ux --version

# Help
claude-ux --help

# Quick analysis
claude-ux quick https://example.com

# Demo mode
claude-ux demo
```

### Expected Output
```
🎯 IMMEDIATE FEEDBACK:
========================
📊 Total Issues: X
🚨 Critical Issues: X
⚡ Quick Wins: X
⏱️  Estimated Fix Time: X minutes
📈 Overall Score: X/100
```

## Troubleshooting

### Common Issues

#### Playwright Installation Issues
```bash
# Clear cache and reinstall
npm cache clean --force
npm install
npx playwright install --force
```

#### Permission Issues (Linux/Mac)
```bash
sudo npm install -g claude-ux-consultant
# or use nvm for Node version management
```

#### Windows Path Issues
```bash
# Use PowerShell as Administrator
npm install -g claude-ux-consultant
```

#### Network/Firewall Issues
```bash
# Configure npm proxy if behind corporate firewall
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### Getting Help

1. **Check Issues**: [GitHub Issues](https://github.com/Abuelrish/Claude-UX-Consultant/issues)
2. **Documentation**: [Full Docs](docs/)
3. **Community**: [Discussions](https://github.com/Abuelrish/Claude-UX-Consultant/discussions)

## Next Steps

After successful installation:

1. **Run Demo**: `npm run demo` to see it in action
2. **Analyze Your Site**: `claude-ux quick http://localhost:3000`
3. **Read Documentation**: Check out the [User Guide](docs/USER_GUIDE.md)
4. **Set Up CI/CD**: Use the provided GitHub Actions template
5. **Configure Monitoring**: Set up automated analysis schedules

## System Requirements

### Minimum Requirements
- **RAM**: 2GB available
- **Storage**: 1GB free space
- **Network**: Internet connection for initial setup
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

### Recommended Requirements
- **RAM**: 4GB+ available
- **Storage**: 2GB+ free space
- **CPU**: Multi-core processor
- **Network**: Broadband connection

## Performance Tips

1. **Close unnecessary applications** during analysis
2. **Use SSD storage** for faster screenshot processing
3. **Increase timeout** for slow sites: `--timeout 60000`
4. **Run analysis during off-peak hours** for production sites
5. **Use quick analysis** for frequent checks, deep analysis for comprehensive audits

---

🎉 **Installation Complete!** You're ready to start analyzing UX issues with AI-powered insights.