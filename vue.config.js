const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    name: 'Youdégo',
    themeColor: '#8C0004',
    msTileColor: '#8C0004',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    manifestPath: 'manifest.json',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      navigateFallback: '/index.html',
      // mettez à jour immédiatement en production
      runtimeCaching: [
        {
          urlPattern: /\/(?:index\.html)?$/,
          handler: 'NetworkFirst',
        },
        {
          urlPattern: /\/.*\.(?:js|css|png|jpg|jpeg|svg|gif|woff2?)$/,
          handler: 'StaleWhileRevalidate',
        }
      ]
    }
  }
})
