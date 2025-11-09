module.exports = {
  ignoreWarnings: [
    {
      module: /node_modules\/react-zoom-pan-pinch/,
      message: /Failed to parse source map/,
    },
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
};