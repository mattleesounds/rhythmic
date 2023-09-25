/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    const { isServer } = options;
    config.module.rules.push({
      test: /\.mp3$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            mimetype: 'audio/mp3'
          }
        }
      ]
    });

    return config;
  }
}

module.exports = nextConfig
