
import { query } from '@anthropic-ai/claude-agent-sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ReviewReport } from './types/report-types.js';
import { ReviewReportSchema } from './types/report-types.js';
import { mcpServersConfig } from './config/mcp.config.js';
import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester,
} from './agents/index.js';
import { buildOrchestratorPrompt } from './prompts/orchestrator.prompt.js';

export interface OrchestratorOptions {
  model?: string;
  cwd?: string;
  timeoutMs?: number;
}

export class CodeReviewOrchestrator {
  private readonly options: OrchestratorOptions;

  constructor(options: OrchestratorOptions = {}) {
    this.options = options;
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<ReviewReport> {
    const startTime = Date.now();

    if (
      !owner.trim() ||
      !repo.trim() ||
      !Number.isInteger(prNumber) ||
      prNumber <= 0
    ) {
      throw new Error('Invalid pull request information.');
    }

    const prompt = buildOrchestratorPrompt(
      owner,
      repo,
      prNumber,
    );

    const queryResult = query({
      prompt,
      options: {
        model:
          this.options.model ??
          process.env.ANTHROPIC_MODEL ??
          'claude-sonnet-4-5-20250929',

        cwd: this.options.cwd ?? process.cwd(),

        mcpServers: mcpServersConfig,

        agents: {
          codeQualityAnalyzer,
          testCoverageAnalyzer,
          refactoringSuggester,
        },

        allowedTools: [
          'Task',
          'mcp__github__pull_request_read',
          'mcp__github__get_file_contents',
          'Skill',
        ],

        outputFormat: {
          type: 'json_schema',
          schema: zodToJsonSchema(
            ReviewReportSchema,
            { $refStrategy: 'root' },
          ),
        },
      },
    });

    let finalReport: ReviewReport | undefined;

    for await (const message of queryResult) {
      if (message.type !== 'result') {
        continue;
      }

      if (message.subtype !== 'success') {
        throw new Error(
          `Code review failed: ${message.subtype}`,
        );
      }

      if (!message.structured_output) {
        throw new Error(
          'The review completed without structured output.',
        );
      }

      finalReport = ReviewReportSchema.parse(
        message.structured_output,
      );
    }

    if (!finalReport) {
      throw new Error(
        'No valid review report was returned.',
      );
    }

    const reportWithMetadata: ReviewReport = {
      ...finalReport,
      metadata: {
        ...finalReport.metadata,
        analyzedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    };

    return ReviewReportSchema.parse(reportWithMetadata);
  }
}
