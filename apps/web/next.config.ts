import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  turbopack: {
    root: __dirname + '/../..',
  },
  transpilePackages: ['@mas/db', '@mas/core', '@mas/agents'],
  serverExternalPackages: ['better-sqlite3'],
  webpack: (webpackConfig) => {
    // Workspace packages import with .js extensions (TS ESM convention).
    // Teach webpack to resolve them to .ts/.tsx sources.
    webpackConfig.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return webpackConfig;
  },
};

export default config;
