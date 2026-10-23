# Enterprise Multi-Agent Code Review Orchestrator

Build a multi-agent system that automates code reviews using the Claude Agent SDK.

## Project Overview

This system uses specialized AI agents to provide comprehensive code reviews:

- **Main Orchestrator** — Coordinates the review process and aggregates results.
- **Code Quality Analyzer** — Identifies code smells, anti-patterns, and best-practice violations.
- **Test Coverage Analyzer** — Evaluates test completeness and suggests missing test cases.
- **Refactoring Suggester** — Recommends architectural improvements and refactoring opportunities.

## What's Provided

The starter project includes the following infrastructure:

- **Type Definitions** (`src/types/`) — Zod schemas for validation.
- **Logger** (`src/utils/logger.ts`) — Winston structured logging.
- **Report Generator** (`src/utils/report-generator.ts`) — Markdown, HTML, and JSON report generation.
- **Project Configuration** — `package.json`, `tsconfig.json`, and `.env.example`.
- **Test Skeletons** (`tests/`) — Test file structure.
- **Example Skill** (`.claude/skills/`) — Sample Claude skill.

## What You Need to Implement

1. **Agent Definitions** (`src/agents/`)
   - Code Quality Analyzer
   - Test Coverage Analyzer
   - Refactoring Suggester

2. **Prompts** (`src/prompts/`)
   - Orchestrator prompt
   - Agent-specific prompts

3. **MCP Configuration** (`src/config/mcp.config.ts`)
   - GitHub MCP server
   - ESLint MCP server

4. **Orchestrator** (`src/orchestrator.ts`)
   - Main coordination logic
   - Agent spawning and result aggregation

5. **Main Entry Point** (`src/main.ts`)
   - CLI argument parsing
   - Environment validation
   - Report generation

6. **Error Handler** (Recommended) (`src/utils/error-handler.ts`)
   - Custom `ReviewError` class
   - Retry logic with exponential backoff
   - Timeout wrapper

7. **Rate Limiter** (Optional) (`src/utils/rate-limiter.ts`)
   - Token bucket algorithm with sliding window
   - Request and token tracking
   - Concurrent request management

## Getting Started

### Prerequisites

- Node.js 18 or later.
- Anthropic API access, provided in the Vocareum workspace, or your own [Anthropic API key](https://console.anthropic.com/).
- GitHub access for pull-request retrieval. A [GitHub Personal Access Token](https://github.com/settings/tokens) is recommended for authenticated access, higher rate limits, and private repositories. Appropriate scopes may include `repo` and `read:org`, depending on the repositories you need to access.

### Installation

#### Vocareum Workspace (Recommended)

The workspace may provide preconfigured Anthropic API credentials.

```bash
# Install dependencies from the repository root
cd /voc/work/cd14715-claude-code-classroom
npm install

# Navigate to the project
cd project/starter

# Configure the environment
cp .env.example .env
```

#### Local Setup

```bash
# Clone the repository
git clone https://github.com/udacity/cd14715-claude-code-classroom.git
cd cd14715-claude-code-classroom/project/starter

# Install dependencies
npm install

# Configure the environment
cp .env.example .env
```

### Configuration

Configure the following environment variables in your `.env` file or execution environment.

#### Model Configuration

```bash
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

#### Project Root

Set `PROJECT_ROOT` to the absolute path of the project directory containing the `.claude/skills/` directory.

Vocareum example:

```bash
PROJECT_ROOT=/voc/work/cd14715-claude-code-classroom/project/starter
```

For local development, use the absolute path to your local project directory.

#### Authentication

In Vocareum, use the Anthropic credentials provided by the workspace. For local development, configure an authentication method supported by your installed Claude Agent SDK.

Do not commit API keys, access tokens, or other secrets to version control.

#### GitHub Access

The application uses GitHub MCP tools to retrieve pull-request information and source files. Access depends on the repository's visibility and the authentication available in your environment.

A GitHub token can be supplied through the `GITHUB_TOKEN` environment variable when needed:

```bash
GITHUB_TOKEN=your-github-token
```

Never commit a real token to the repository.

#### Logging (Optional)

```bash
LOG_LEVEL=info
```

Supported levels: `error`, `warn`, `info`, and `debug`.

## Running the Application

### Development Mode

```bash
npm run dev -- <owner> <repo> <pr-number>
```

### Production Build

```bash
npm run build
npm start <owner> <repo> <pr-number>
```

### Example

```bash
npm run dev -- facebook react 12345
```

Replace the example values with a real repository owner, repository name, and pull-request number.

The example is illustrative; the repository and pull request must exist and be accessible to your configured GitHub MCP server.

## Testing

Run the test suite:

```bash
npm test
```

Run a specific test file:

```bash
npm test -- orchestrator.test.ts
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Check TypeScript compilation:

```bash
npm run build
```

Run the project's lint script:

```bash
npm run lint
```

## Key Technologies

- **Claude Agent SDK** — Multi-agent orchestration framework.
- **Model Context Protocol (MCP)** — External tool integration.
- **Zod** — Schema validation and type safety.
- **TypeScript** — Type-safe development.
- **Vitest** — Testing framework.
- **Winston** — Structured logging.

## Success Criteria

The implementation is complete when:

- [ ] TypeScript compiles without errors using `npm run build`.
- [ ] Automated tests pass using `npm test`.
- [ ] The application can review a real, accessible pull request.
- [ ] Reports are generated in at least one supported format: Markdown, HTML, or JSON.
- [ ] Optional rate limiting prevents API throttling.
- [ ] Errors are handled gracefully.

## Resources

- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Zod Documentation](https://zod.dev/)

Good luck!
