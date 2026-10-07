module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Debe ir al final: Reanimated lo necesita para compilar las animaciones.
    plugins: ['react-native-reanimated/plugin'],
  };
};
