const Encore = require('@symfony/webpack-encore');
const path = require('path');


if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .addEntry('app', './assets/app.js')
    .addAliases({
        '@symfony/stimulus-bridge/controllers.json': path.resolve(__dirname, 'assets/controllers.json'),
    })
    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .enablePostCssLoader()
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .enableStimulusBridge('./assets/controllers.json')
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = '3.38';
    })

;

module.exports = Encore.getWebpackConfig();
