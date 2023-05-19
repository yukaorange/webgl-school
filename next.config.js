/** @type {import('next').NextConfig} */


// const nextConfig = {
//   reactStrictMode: true,
// };

// module.exports = nextConfig;

const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // .glsl ファイルのローディング設定を追加
    config.module.rules.push({
      test: /\.glsl$/,
      use: 'raw-loader',
    });

    // 既存の設定を返す
    return config;
  },
};

module.exports = nextConfig;