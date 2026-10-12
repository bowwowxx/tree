/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
