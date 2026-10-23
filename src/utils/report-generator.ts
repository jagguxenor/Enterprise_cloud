
import type { ReviewReport } from '../types/report-types.js';

/**
 * Converts review results into Markdown, HTML, and JSON reports.
 */
export class ReportGenerator {
  /**
   * Escape untrusted text before inserting it into HTML.
   */
  private escapeHTML(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[character] ?? character;
    });
  }

  /**
   * Generate a Markdown report for a pull request.
   */
  generateMarkdownReport(report: ReviewReport): string {
    const { summary, recommendations, fileReviews, pullRequest, metadata } =
      report;

    const formattedRecs = recommendations
      .slice(0, 5)
      .map((rec, index) => {
        const emoji = {
          critical: '🚨',
          high: '⚠️',
          medium: '📝',
          low: '💡',
        }[rec.priority];

        return `${index + 1}. ${emoji} **${rec.category}**: ${rec.description}
   - Files: ${rec.files.join(', ')}`;
      })
      .join('\n\n');

    const formattedFiles = fileReviews
      .map((review) => {
        const { file, codeQuality, testCoverage, refactorings } = review;

        const issueList = codeQuality.issues
          .slice(0, 3)
          .map(
            (issue) =>
              `  - Line ${issue.line}: \`${issue.severity}\` ${issue.description}`,
          )
          .join('\n');

        const testList = testCoverage.untestedPaths
          .slice(0, 2)
          .map(
            (path) =>
              `  - \`${path.location}\` (${path.priority} priority)`,
          )
          .join('\n');

        const refactorList = refactorings.suggestions
          .slice(0, 2)
          .map(
            (suggestion) =>
              `  - **${suggestion.type}**: ${suggestion.description}`,
          )
          .join('\n');

        return `### 📄 \`${file}\`

**Quality Score:** ${codeQuality.overallScore}/100 | **Coverage:** ~${testCoverage.coverageEstimate}%

#### Issues (${codeQuality.issues.length})
${issueList || '  None found'}
${codeQuality.issues.length > 3 ? `\n  *...and ${codeQuality.issues.length - 3} more*` : ''}

#### Test Gaps (${testCoverage.untestedPaths.length})
${testList || '  None found'}
${testCoverage.untestedPaths.length > 2 ? `\n  *...and ${testCoverage.untestedPaths.length - 2} more*` : ''}

#### Refactoring Opportunities (${refactorings.suggestions.length})
${refactorList || '  None found'}
${refactorings.suggestions.length > 2 ? `\n  *...and ${refactorings.suggestions.length - 2} more*` : ''}`;
      })
      .join('\n\n---\n\n');

    return `# 🔍 Code Review Report

**Pull Request:** ${pullRequest.owner}/${pullRequest.repo} #${pullRequest.number}

## Summary

| Metric | Value |
|--------|-------|
| **Overall Score** | ${summary.overallScore}/100 |
| **Files Reviewed** | ${summary.totalFiles} |
| **Critical Issues** | ${summary.criticalIssues} |
| **High Priority Tests** | ${summary.highPriorityTests} |
| **Refactoring Opportunities** | ${summary.refactoringOpportunities} |

## 🎯 Top Recommendations

${formattedRecs || 'No recommendations at this time.'}

## 📁 File Details

${formattedFiles || 'No file reviews are available.'}

---

*Generated at ${metadata.analyzedAt} • Duration: ${metadata.duration}ms*
`;
  }

  /**
   * Generate an HTML report for browser display.
   */
  generateHTMLReport(report: ReviewReport): string {
    const { summary, recommendations, fileReviews, metadata, pullRequest } =
      report;

    const e = (value: string): string => this.escapeHTML(value);

    const recList = recommendations
      .slice(0, 5)
      .map(
        (recommendation) => `
      <li class="rec-${recommendation.priority}">
        <span class="priority">[${e(recommendation.priority.toUpperCase())}]</span>
        <strong>${e(recommendation.category)}</strong>: ${e(recommendation.description)}
        <br><small>Files: ${recommendation.files.map(e).join(', ')}</small>
      </li>
    `,
      )
      .join('');

    const fileSections = fileReviews
      .map(
        ({ file, codeQuality, testCoverage, refactorings }) => `
      <section class="file-review">
        <h2>${e(file)}</h2>
        <p>
          <strong>Quality Score:</strong> ${codeQuality.overallScore}/100
          &nbsp;|&nbsp;
          <strong>Coverage Estimate:</strong> ${testCoverage.coverageEstimate}%
        </p>

        <h3>Issues (${codeQuality.issues.length})</h3>
        ${
          codeQuality.issues.length
            ? `<ul>${codeQuality.issues
                .map(
                  (issue) =>
                    `<li>Line ${issue.line} — <strong>${e(issue.severity)}</strong>: ${e(issue.description)}<br><small>Suggestion: ${e(issue.suggestion)}</small></li>`,
                )
                .join('')}</ul>`
            : '<p>None reported.</p>'
        }

        <h3>Test Gaps (${testCoverage.untestedPaths.length})</h3>
        ${
          testCoverage.untestedPaths.length
            ? `<ul>${testCoverage.untestedPaths
                .map(
                  (path) =>
                    `<li><strong>${e(path.type)}</strong> — ${e(path.location)} (${e(path.priority)} priority)<br>${e(path.reasoning)}<br><small>Suggested test: ${e(path.suggestedTest)}</small></li>`,
                )
                .join('')}</ul>`
            : '<p>None reported.</p>'
        }

        <h3>Refactoring Opportunities (${refactorings.suggestions.length})</h3>
        ${
          refactorings.suggestions.length
            ? `<ul>${refactorings.suggestions
                .map(
                  (suggestion) =>
                    `<li><strong>${e(suggestion.type)}</strong> (${e(suggestion.impact)} impact): ${e(suggestion.description)}<br><small>Location: ${e(suggestion.location)}</small><pre><code>${e(suggestion.before)}</code></pre><pre><code>${e(suggestion.after)}</code></pre><p>${e(suggestion.benefits)}</p></li>`,
                )
                .join('')}</ul>`
            : '<p>None reported.</p>'
        }
      </section>
    `,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Review — ${e(pullRequest.owner)}/${e(pullRequest.repo)} #${pullRequest.number}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
      background: #f8f9fa;
      color: #212529;
      line-height: 1.5;
    }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 12px; }
    .summary {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 24px 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    .metric { text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; color: #3498db; }
    .metric-label { color: #6c757d; font-size: 0.9em; }
    ul { padding-left: 24px; }
    li { padding: 12px; margin: 8px 0; border-radius: 4px; background: white; overflow-wrap: anywhere; }
    .rec-critical { border-left: 4px solid #e74c3c; }
    .rec-high { border-left: 4px solid #f39c12; }
    .rec-medium { border-left: 4px solid #3498db; }
    .rec-low { border-left: 4px solid #27ae60; }
    .priority { font-weight: bold; margin-right: 8px; }
    .file-review { background: white; padding: 20px; margin: 24px 0; border-radius: 8px; }
    pre { padding: 12px; background: #f1f3f5; overflow-x: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
    footer { text-align: center; color: #6c757d; margin-top: 32px; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>🔍 Code Review Report</h1>
  <p><strong>Pull Request:</strong> ${e(pullRequest.owner)}/${e(pullRequest.repo)} #${pullRequest.number}</p>

  <div class="summary">
    <div class="metric"><div class="metric-value">${summary.overallScore}</div><div class="metric-label">Overall Score</div></div>
    <div class="metric"><div class="metric-value">${summary.totalFiles}</div><div class="metric-label">Files Reviewed</div></div>
    <div class="metric"><div class="metric-value">${summary.criticalIssues}</div><div class="metric-label">Critical Issues</div></div>
    <div class="metric"><div class="metric-value">${summary.highPriorityTests}</div><div class="metric-label">Tests Needed</div></div>
    <div class="metric"><div class="metric-value">${summary.refactoringOpportunities}</div><div class="metric-label">Refactorings</div></div>
  </div>

  <h2>🎯 Top Recommendations</h2>
  <ul>${recList || '<li>No recommendations at this time.</li>'}</ul>

  <h2>📁 File Details</h2>
  ${fileSections || '<p>No file reviews are available.</p>'}

  <footer>
    Generated at ${e(metadata.analyzedAt)} • Duration: ${metadata.duration}ms
  </footer>
</body>
</html>`;
  }

  /**
   * Generate a formatted JSON report.
   */
  generateJSONReport(report: ReviewReport): string {
    return JSON.stringify(report, null, 2);
  }
}
