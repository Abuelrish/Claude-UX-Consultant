/**
 * HTML Reporter
 * Generates executive-friendly HTML reports with visual dashboards
 */

const fs = require('fs').promises;
const path = require('path');

class HTMLReporter {
  constructor() {
    this.template = this.getTemplate();
  }

  async generate(analysisResults, options = {}) {
    const outputPath = options.outputPath || `./reports/ux-analysis-${Date.now()}.html`;
    
    const reportData = {
      title: `UX Analysis Report - ${new URL(analysisResults.url).hostname}`,
      timestamp: new Date().toLocaleString(),
      url: analysisResults.url,
      summary: analysisResults.summary,
      issues: analysisResults.issues,
      recommendations: analysisResults.recommendations,
      metrics: analysisResults.metrics,
      scores: analysisResults.scores || {},
      screenshots: analysisResults.screenshots || []
    };
    
    const html = this.renderTemplate(reportData);
    await fs.writeFile(outputPath, html);
    
    return outputPath;
  }

  renderTemplate(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .issue-critical { border-left: 4px solid #ef4444; }
        .issue-high { border-left: 4px solid #f97316; }
        .issue-medium { border-left: 4px solid #eab308; }
        .issue-low { border-left: 4px solid #22c55e; }
        .screenshot-container {
            max-width: 100%;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .metric-card {
            transition: transform 0.2s;
        }
        .metric-card:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="gradient-bg text-white">
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-2">🎯 Claude UX Consultant Report</h1>
            <p class="text-blue-100 text-lg">Comprehensive UX Analysis & Recommendations</p>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="card p-4 rounded-lg">
                    <h3 class="text-gray-700 font-semibold">Overall Score</h3>
                    <p class="text-3xl font-bold text-blue-600">${data.summary.overallScore || 0}/100</p>
                </div>
                <div class="card p-4 rounded-lg">
                    <h3 class="text-gray-700 font-semibold">Total Issues</h3>
                    <p class="text-3xl font-bold text-yellow-600">${data.summary.totalIssues || 0}</p>
                </div>
                <div class="card p-4 rounded-lg">
                    <h3 class="text-gray-700 font-semibold">Critical Issues</h3>
                    <p class="text-3xl font-bold text-red-600">${data.summary.criticalIssues || 0}</p>
                </div>
                <div class="card p-4 rounded-lg">
                    <h3 class="text-gray-700 font-semibold">Quick Wins</h3>
                    <p class="text-3xl font-bold text-green-600">${data.summary.quickWins || 0}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        <!-- Analysis Details -->
        <div class="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">📊 Analysis Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-600"><strong>URL:</strong> ${data.url}</p>
                    <p class="text-gray-600"><strong>Timestamp:</strong> ${data.timestamp}</p>
                    <p class="text-gray-600"><strong>Analysis Type:</strong> ${data.analysisType || 'Standard'}</p>
                </div>
                <div>
                    <p class="text-gray-600"><strong>Fix Time:</strong> ${data.summary.estimatedFixTime || 0} minutes</p>
                    <p class="text-gray-600"><strong>Recommendations:</strong> ${data.recommendations.length}</p>
                </div>
            </div>
        </div>

        <!-- Priority Actions -->
        ${data.summary.priorityActions && data.summary.priorityActions.length > 0 ? `
        <div class="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">🔥 Priority Actions</h2>
            <div class="space-y-3">
                ${data.summary.priorityActions.map((action, index) => `
                    <div class="issue-critical p-4 rounded-lg bg-red-50">
                        <h3 class="font-semibold text-red-800">${index + 1}. ${action.title}</h3>
                        <p class="text-red-700 mt-2">${action.description}</p>
                        <p class="text-sm text-red-600 mt-1"><strong>Fix:</strong> ${action.action}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Issues Section -->
        ${data.issues.length > 0 ? `
        <div class="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">🚨 Issues Found</h2>
            <div class="space-y-4">
                ${data.issues.map(issue => `
                    <div class="issue-${issue.severity || issue.impact || 'medium'} p-4 rounded-lg bg-gray-50">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-semibold text-gray-800">${issue.title}</h3>
                            <span class="px-2 py-1 rounded text-xs font-medium bg-${this.getSeverityColor(issue.severity || issue.impact)}-100 text-${this.getSeverityColor(issue.severity || issue.impact)}-800">
                                ${issue.severity || issue.impact || 'medium'}
                            </span>
                        </div>
                        <p class="text-gray-700 mb-2">${issue.description}</p>
                        <p class="text-sm text-gray-600"><strong>Fix:</strong> ${issue.fix || issue.solution || 'See description'}</p>
                        ${issue.category ? `<p class="text-xs text-gray-500 mt-1">Category: ${issue.category}</p>` : ''}
                        ${issue.wcag ? `<p class="text-xs text-blue-600 mt-1">WCAG: ${issue.wcag}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Recommendations Section -->
        ${data.recommendations.length > 0 ? `
        <div class="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">💡 Recommendations</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${data.recommendations.map(rec => `
                    <div class="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-400">
                        <h3 class="font-semibold text-blue-800">${rec.title}</h3>
                        <p class="text-blue-700 mt-2">${rec.description}</p>
                        <p class="text-sm text-blue-600 mt-1"><strong>Suggestion:</strong> ${rec.suggestion || rec.fix || 'See description'}</p>
                        ${rec.category ? `<p class="text-xs text-blue-500 mt-1">Category: ${rec.category}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Screenshots Section -->
        ${data.screenshots.length > 0 ? `
        <div class="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">📸 Screenshots</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${data.screenshots.map(screenshot => `
                    <div class="screenshot-container">
                        <img src="${screenshot}" alt="Screenshot" class="w-full h-auto" />
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Metrics Section -->
        <div class="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">📈 Metrics</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${Object.entries(data.metrics).map(([key, value]) => `
                    <div class="metric-card p-4 bg-gray-50 rounded-lg">
                        <h3 class="text-sm font-medium text-gray-600">${this.formatMetricName(key)}</h3>
                        <p class="text-2xl font-bold text-gray-800">${value}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Scores Section -->
        ${Object.keys(data.scores).length > 0 ? `
        <div class="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">🎯 Scores</h2>
            <div class="space-y-4">
                ${Object.entries(data.scores).map(([key, value]) => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">${this.formatMetricName(key)}</span>
                        <div class="flex items-center">
                            <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: ${typeof value === 'number' ? Math.min(value, 100) : 0}%"></div>
                            </div>
                            <span class="text-sm font-medium text-gray-600">${value}${typeof value === 'number' ? '/100' : ''}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Next Steps -->
        <div class="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">🚀 Next Steps</h2>
            <div class="space-y-3">
                ${data.summary.criticalIssues > 0 ? `
                    <div class="flex items-center p-3 bg-red-50 rounded-lg">
                        <span class="text-red-600 mr-3">🚨</span>
                        <span class="text-red-800">Fix ${data.summary.criticalIssues} critical issues immediately</span>
                    </div>
                ` : ''}
                ${data.summary.highIssues > 0 ? `
                    <div class="flex items-center p-3 bg-orange-50 rounded-lg">
                        <span class="text-orange-600 mr-3">🔴</span>
                        <span class="text-orange-800">Address ${data.summary.highIssues} high priority issues this sprint</span>
                    </div>
                ` : ''}
                ${data.summary.quickWins > 0 ? `
                    <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <span class="text-green-600 mr-3">⚡</span>
                        <span class="text-green-800">Implement ${data.summary.quickWins} quick wins for easy improvements</span>
                    </div>
                ` : ''}
                ${data.summary.totalIssues === 0 ? `
                    <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <span class="text-green-600 mr-3">✅</span>
                        <span class="text-green-800">Great job! No major issues found. Consider running deep analysis for optimization opportunities.</span>
                    </div>
                ` : ''}
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="container mx-auto px-4 text-center">
            <p class="text-lg font-semibold mb-2">🎯 Claude UX Consultant</p>
            <p class="text-gray-400">AI-Powered UX Analysis & Testing Tool</p>
            <p class="text-gray-400 text-sm mt-2">Generated on ${data.timestamp}</p>
        </div>
    </footer>
</body>
</html>
    `;
  }

  getSeverityColor(severity) {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  }

  formatMetricName(name) {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  getTemplate() {
    // Template is now inline in renderTemplate method
    return null;
  }
}

module.exports = HTMLReporter;