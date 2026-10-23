
import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

import {
  CODE_QUALITY_ANALYZER_PROMPT,
} from '../prompts/code-quality-analyzer.prompt.js';

export const codeQualityAnalyzer: AgentDefinition = {
  description:
    'Examines pull-request changes for security issues, defects, performance risks, and maintainability problems.',

  prompt: CODE_QUALITY_ANALYZER_PROMPT,

  model: 'inherit',

  tools: [
    'mcp__github__pull_request_read',
    'Skill',
  ],
};
