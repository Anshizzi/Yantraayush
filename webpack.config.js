// File: frontend/webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // This is the important part
  // It ensures that 'react-native-gesture-handler' is correctly aliased for web
  config.resolve.alias['react-native-gesture-handler'] =
    require.resolve('react-native-gesture-handler');

  return config;
};