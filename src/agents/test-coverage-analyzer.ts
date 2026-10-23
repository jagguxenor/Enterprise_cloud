
import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

import {
  TEST_COVERAGE_ANALYZER_PROMPT,
} from '../prompts/test-coverage-analyzer.prompt.js';

export const testCoverageAnalyzer: AgentDefinition = {
  description:
    'Evaluates pull-request changes and identifies missing tests, untested paths, and important edge cases.',

  prompt: TEST_COVERAGE_ANALYZER_PROMPT,

  model: 'inherit',

  tools: [
    'mcp__github__pull_request_read',
    'Skill',
  ],
};
