// In frontend/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './',
          },
        },
      ],
      // Reanimated plugin must be last
      'react-native-reanimated/plugin',
    ],
  };
};