
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import {
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringSuggestionSchema,
} from './analysis-results.js';

export const ReviewReportSchema = z.object({
  pullRequest: z.object({
    owner: z.string(),
    repo: z.string(),
    number: z.number().int().positive(),
  }),

  fileReviews: z.array(
    z.object({
      file: z.string(),
      codeQuality: CodeQualityResultSchema,
      testCoverage: TestCoverageResultSchema,
      refactorings: RefactoringSuggestionSchema,
    }),
  ),

  summary: z.object({
    totalFiles: z.number().int().nonnegative(),
    overallScore: z.number().min(0).max(100),
    criticalIssues: z.number().int().nonnegative(),
    highPriorityTests: z.number().int().nonnegative(),
    refactoringOpportunities: z.number().int().nonnegative(),
  }),

  recommendations: z.array(
    z.object({
      priority: z.enum(['critical', 'high', 'medium', 'low']),
      category: z.string(),
      description: z.string(),
      files: z.array(z.string()),
    }),
  ),

  metadata: z.object({
    analyzedAt: z.string(),
    duration: z.number().nonnegative(),
    agentVersions: z.record(z.string(), z.string()),
  }),
});

export type ReviewReport = z.infer<typeof ReviewReportSchema>;

export const ReviewReportJSONSchema = zodToJsonSchema(
  ReviewReportSchema,
  { $refStrategy: 'root' },
);
