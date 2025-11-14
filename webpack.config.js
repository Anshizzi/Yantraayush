// File: frontend/webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path'); 
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Alias for react-native-gesture-handler
  config.resolve.alias['react-native-gesture-handler'] =
    require.resolve('react-native-gesture-handler');

  config.resolve.alias['@shopify/react-native-skia'] =
    require.resolve('@shopify/react-native-skia');

  config.module.rules.push({
    test: /skia\.wasm$/,
    type: 'asset/resource',
    generator: {
      filename: 'static/media/[name][ext]',
    },
  });
  //SKIA
  return config;
};