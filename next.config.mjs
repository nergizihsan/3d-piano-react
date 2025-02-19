/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Enable WebAssembly for Tone.js
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Handle audio files and 3D model files
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      type: 'asset/resource'
    })

    return config
  },
  // Optional: Optimize image domains if you're using external images
  // images: {
  //   domains: ['your-domain.com'],
  // },
}

export default nextConfig
