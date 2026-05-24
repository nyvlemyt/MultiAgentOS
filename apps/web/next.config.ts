import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  turbopack: {
    root: __dirname + '/../..',
  },
  transpilePackages: ['@mas/db', '@mas/core', '@mas/agents'],
};

export default config;
