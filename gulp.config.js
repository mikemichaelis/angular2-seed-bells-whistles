module.exports = function() {

    var rootDir = './';
    var srcDir = rootDir + 'src/';

    var app = 'app/';
    var styles = 'styles/';
    var fonts = 'fonts/';
    var images = 'images/';
    var js = 'js/';
    var config = 'config/';
    var jspm = 'jspm_packages/';
    var build = 'build/';
    var publish = 'publish/';
    var test = 'test/';
    var prod = 'prod/';

    var index = 'index.html';
    var main = 'main.js';
    var tsconfig = 'tsconfig.json';

    var systemScript = [
        '<script src="js/system.js"></script>',
        '<script src="config/system.config.js"></script>'
        ];
    var appScript = ['<script src="js/main.bundle.js"></script>'];

    var baseUrlTest = '<base href="/">';
    var baseUrlProd = '<base href="/">';

    var systemConfig = 'system.config.js';
    var systemTestConfig = 'system.config.js';
    var systemProdConfig = 'system.config.js';

    var appConfig = 'app.config.json';
    var appTestConfig = 'app.config.test.json';
    var appProdConfig = 'app.config.prod.json';

    var browsers = ['last 2 version', '> 5%'];

    var cfg = {
        sourcemaps: true,

        index: index,
        tsconfig: tsconfig,

        app: app,
        styles: styles,
        fonts: fonts,
        images: images,
        js: js,
        config: config,
        jspm: jspm,

        build: build,
        publish: publish,
        test: test,
        prod: prod,

        rootDir: rootDir,
        srcDir: srcDir,
        appDir: srcDir + app,

        indexSrc: srcDir + index,
        mainSrc: srcDir + app + main,

        configDir: srcDir + config,
        stylesDir: srcDir + styles,
        fontsDir: srcDir + fonts,
        imagesDir: srcDir + images,
        jspmDir: srcDir + jspm,

        buildDir: rootDir + build,

        publishDir: rootDir + publish,
        publishTestDir: rootDir + publish + test,
        publishProdDir: rootDir + publish + prod,

        systemScript: systemScript,
        appScript: appScript,

        baseUrlTest: baseUrlTest,
        baseUrlProd: baseUrlProd,

        systemConfig: systemConfig,
        systemTestConfig: systemTestConfig,
        systemProdConfig: systemProdConfig,

        appConfig: appConfig,
        appTestConfig: appTestConfig,
        appProdConfig: appProdConfig,

        browsers: browsers
    };

    return cfg;
};
