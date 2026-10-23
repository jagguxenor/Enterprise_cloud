
/**
 * MCP server configuration for GitHub pull-request access
 * and ESLint-based static analysis.
 */

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.warn(
    'GITHUB_TOKEN is not set. GitHub MCP access may fail or be restricted.',
  );
}

export const mcpServersConfig = {
  github: {
    type: 'stdio' as const,
    command: 'npx',
    args: [
      '-y',
      '@modelcontextprotocol/server-github',
    ],
    env: {
      ...(githubToken
        ? { GITHUB_PERSONAL_ACCESS_TOKEN: githubToken }
        : {}),
    },
  },

  eslint: {
    type: 'stdio' as const,
    command: 'npx',
    args: [
      '-y',
      '@eslint/mcp@latest',
    ],
    env: {},
  },
};
