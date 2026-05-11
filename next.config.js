/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["alchemy-sdk"],
  },
};

module.exports = nextConfig;
