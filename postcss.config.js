export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        "> 1%",
        "last 2 versions",
        "not dead",
        "not ie 11"
      ],
      // Disable -ms-high-contrast to avoid deprecation warnings
      remove: false,
      grid: false
    },
    // Suppress specific deprecation warnings
    'postcss-preset-env': {
      stage: 1,
      features: {
        'custom-properties': false
      }
    }
  },
}
