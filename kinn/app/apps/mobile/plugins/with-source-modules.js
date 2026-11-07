// The prebuilt Expo module binaries in SDK 58 do not all match the installed expo-modules-core, and the
// app crashes at launch with a missing AnyModule symbol. Building the modules from source avoids that.
// The React Native core stays prebuilt, so this only adds a few minutes to a clean build.
const { withPodfileProperties } = require('expo/config-plugins')

module.exports = (config) =>
  withPodfileProperties(config, (next) => {
    next.modResults.EXPO_USE_PRECOMPILED_MODULES = 'false'
    return next
  })
