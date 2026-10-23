
import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts/refactoring-suggester.prompt.js';

export const refactoringSuggester: AgentDefinition = {
  description:
    'Reviews changed code and recommends practical improvements to readability, maintainability, and structure.',

  model: 'inherit',

  tools: [
    'mcp__github__pull_request_read',
    'Skill',
  ],

  prompt: REFACTORING_SUGGESTER_PROMPT,
};
