/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for ffmpeg.wasm to work properly due to SharedArrayBuffer requirements
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
