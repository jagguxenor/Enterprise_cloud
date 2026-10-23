
import * as dotenv from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';

dotenv.config();

async function main(): Promise<void> {
  const [owner, repo, prString] = process.argv.slice(2);

  if (!owner || !repo || !prString) {
    console.error(
      'Usage: npm run dev -- <owner> <repo> <pr-number>',
    );
    process.exitCode = 1;
    return;
  }

  const prNumber = Number(prString);

  if (!Number.isSafeInteger(prNumber) || prNumber <= 0) {
    console.error('Error: PR number must be a positive integer.');
    process.exitCode = 1;
    return;
  }

  const model = process.env.ANTHROPIC_MODEL;

  if (!model) {
    console.error(
      'Error: Set ANTHROPIC_MODEL in your environment configuration.',
    );
    process.exitCode = 1;
    return;
  }

  const projectRoot = process.env.PROJECT_ROOT
    ? path.resolve(process.env.PROJECT_ROOT)
    : process.cwd();

  if (
    !process.env.ANTHROPIC_API_KEY &&
    !process.env.ANTHROPIC_BASE_URL &&
    !process.env.AWS_ACCESS_KEY_ID
  ) {
    console.warn(
      'No explicit API credentials detected. ' +
        'The Claude Agent SDK may use an existing authenticated session.',
    );
  }

  if (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    !process.env.AWS_REGION
  ) {
    console.error(
      'Error: AWS_REGION is required when using AWS credentials.',
    );
    process.exitCode = 1;
    return;
  }

  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      'GITHUB_TOKEN is not set. GitHub MCP operations may have limited access or fail.',
    );
  }

  console.log(
    `🔍 Reviewing ${owner}/${repo} PR #${prNumber}...`,
  );
  console.log(`Model: ${model}`);
  console.log(`Project root: ${projectRoot}`);

  try {
    const orchestrator = new CodeReviewOrchestrator({
      model,
      cwd: projectRoot,
    });

    const report = await orchestrator.reviewPullRequest(
      owner,
      repo,
      prNumber,
    );

    const reportGenerator = new ReportGenerator();

    const markdownReport =
      reportGenerator.generateMarkdownReport(report);

    const htmlReport =
      reportGenerator.generateHTMLReport(report);

    const jsonReport =
      reportGenerator.generateJSONReport(report);

    const reportsDirectory = path.join(process.cwd(), 'reports');
    await mkdir(reportsDirectory, { recursive: true });

    const safeBaseName =
      `${owner}_${repo}_${prNumber}`.replace(
        /[^a-zA-Z0-9._-]/g,
        '_',
      );

    await Promise.all([
      writeFile(
        path.join(reportsDirectory, `${safeBaseName}.md`),
        markdownReport,
        'utf-8',
      ),
      writeFile(
        path.join(reportsDirectory, `${safeBaseName}.html`),
        htmlReport,
        'utf-8',
      ),
      writeFile(
        path.join(reportsDirectory, `${safeBaseName}.json`),
        jsonReport,
        'utf-8',
      ),
    ]);

    console.log('✅ Code review completed successfully.');
    console.log(
      `📄 ${path.join(reportsDirectory, `${safeBaseName}.md`)}`,
    );
    console.log(
      `🌐 ${path.join(reportsDirectory, `${safeBaseName}.html`)}`,
    );
    console.log(
      `📦 ${path.join(reportsDirectory, `${safeBaseName}.json`)}`,
    );
  } catch (error: unknown) {
    console.error(
      '❌ Code review failed:',
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(
    '❌ Unexpected application error:',
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
});
