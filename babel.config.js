module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // This defines the "@" shortcut
            '@': './',
          },
        },
      ],
      // Make sure reanimated plugin is always last
      'react-native-reanimated/plugin',
    ],
  };
};