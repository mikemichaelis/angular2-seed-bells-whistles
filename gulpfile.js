var gulp = require('gulp');
var config = require('./gulp.config')();
var del = require('del');
var args = require('yargs').argv;
var tslintstylish = require('gulp-tslint-stylish');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var path = require('path');
var fallback = require('connect-history-api-fallback');
var logger = require('connect-logger');
var $ = require('gulp-load-plugins')({lazy: true});
var _ = require('lodash');

gulp.task('default', ['help']);
gulp.task('help', $.taskListing);

gulp.task('start', function() {
    runSequence('compile', ['watch', 'serve-dev']);
});

gulp.task('compile', function(done) {
    runSequence('clean', 'lint', 'ts', 'sass', 'inject', 'import-fonts', function() {
        done();
    });
});

gulp.task('watch', ['watch-html', 'watch-ts', 'watch-sass']);

gulp.task('build',  function(done) {
    runSequence('compile', 'copy-build', function() {
        done();
    });
});

gulp.task('copy-build', function(done) {
    runSequence('clean-build', ['bundle-jspm', 'copy-system', 'copy-html', 'copy-css', 'copy-styles', 'copy-fonts', 'copy-images', 'copy-config', 'copy-root'], function(){
        done();
    });
});

gulp.task('publish', function(done) {

    if (!checkPublishArgs()) { return; }

    runSequence('build', 'inject-build', 'copy-publish', 'config-publish', function() {
        done();
    });
});

gulp.task('lint', function(done) {
    runSequence('lint-ts', 'lint-html', 'lint-js', function() {
        done();
    });
});

gulp.task('inject', ['inject-styles']);

gulp.task('clean', [], function(done) {
    runSequence('clean-app', 'clean-build', 'clean-publish', function() {
       done();
   });
});

gulp.task('serve-dev', function() {
    log('Starting development http server');

    var css = config.srcDir + '**/*.css';
    var js = config.srcDir + '**/*.js';

    var cfg = {
        injectChanges: false,
        files: [config.indexSrc, js, css],
        watchOptions: {
            ignored: 'jspm_packages'
        },
        server: {
            port:3000,
            baseDir: './src',
            index: config.index,
            middleware: [
                logger({format: '%date %status %method %url'}),
                fallback({
                    index: '/index.html',
                    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'] // systemjs workaround
                })
            ]
        }
    };

    // Fixes browsersync error when overriding middleware array
    // https://github.com/johnpapa/lite-server/blob/master/lib/lite-server.js
    if (cfg.middleware) {
        cfg.middleware = _.compact(cfg.middleware);
    }

    browserSync.init(cfg);
});

gulp.task('ts', function() {
    var src = config.appDir + '**/*.ts';
    log('Compiling ' + src);

    var tsProject = $.typescript.createProject(config.tsconfig);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.if(config.sourcemaps, $.sourcemaps.init()))
        .pipe($.typescript(tsProject))
        .pipe($.if(config.sourcemaps, $.sourcemaps.write('.')))
        .pipe(gulp.dest(config.appDir));
});

gulp.task('lint-ts', function() {
    log('Analyzing ' + config.appDir + '**/*.ts');
    return gulp
        .src(config.appDir + '**/*.ts')
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.tslint())
        .pipe($.tslint.report($.tslintStylish, {
            emitError: false,
            fullPath: false,
            summarizeFailureOutput: true
        }));
    //.pipe(tslint.report('prose'), {emitError: false});
});

gulp.task('watch-ts', function(done) {
    var src = config.appDir + '**/*.ts';
    log('Watching ' + src);

    gulp.watch([src], ['ts']);
});

gulp.task('lint-html', function(done) {
    log('Analyzing ' + config.indexSrc);

    return gulp
        .src(config.indexSrc)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.htmllint({}, htmllintReporter));
});

gulp.task('watch-html', function(done) {
    var src = [config.appDir + '**/*.html', config.appDir + '**/*.htm'];
    log('Watching ' + src);

    gulp.watch([src]).on('change', browserSync.reload);
});

gulp.task('watch-sass', function() {
    var src = config.srcDir + '**/*.scss';
    log('Watching ' + src);

    gulp.watch([src], ['sass']);
});

gulp.task('watch-css', function() {
    var src = config.stylesDir + '**/*.css';
    log('Watching ' + src);

    gulp.watch(src, function() {
        log('Streaming ' + src);
        gulp.src(src).pipe(browserSync.stream());
    });
});

gulp.task('lint-js', function() {
});

gulp.task('clean-app', function() {
    var src = [
        config.appDir + '**/*.css',
        config.stylesDir + '**/*.css',
        config.appDir + '**/*.map',
        config.appDir + '**/*.js'
        ];
    return clean(src);
});

gulp.task('sass', function() {

    var src = config.srcDir + '**/*.scss';

    log('Building ' + src + ' --> *.css');

    return gulp
        .src([src], {base: './'})
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.if(config.sourcemaps, $.sourcemaps.init()))
        .pipe($.sass())
        .pipe($.autoprefixer({browsers: config.browsers}))
        .pipe($.if(config.sourcemaps, $.sourcemaps.write('.')))
        .pipe(gulp.dest('./'));
});

gulp.task('inject-styles', function() {

    log('Injecting ' + config.stylesDir + '*.css --> ' + config.indexSrc);

    return gulp
        .src(config.indexSrc)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.inject(gulp.src(config.stylesDir + '*.css'), {relative: true}))
        .pipe(gulp.dest(config.srcDir));
});

gulp.task('import-fonts', function() {
    var src = [
        config.srcDir + 'jspm_packages/npm/font-awesome*/fonts/**/*'
    ];

    log('Import ' + src + ' to ' + config.fontsDir);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.flatten())
        .pipe(gulp.dest(config.fontsDir));
});

gulp.task('clean-build', function() {
    var src = config.buildDir + '**/*';
    return clean(src);
});

gulp.task('bundle-jspm', function() {
    var src = config.mainSrc;
    var dest = config.buildDir + config.js;

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jspm())
        .pipe(gulp.dest(dest));
});

gulp.task('copy-system', function() {
    var src = config.jspmDir + 'system*.js';
    var dest = config.buildDir + config.js;

    log('Copy ' + src + ' to ' + dest);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(dest));
});

gulp.task('copy-html', function() {
    var src = config.appDir + '**/*.html';
    var dest = config.buildDir + config.app;

    log('Copy ' + src + ' to ' + dest);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(dest));
});

gulp.task('copy-css', function() {
    var src = config.appDir + '**/*.css';
    var dest = config.buildDir + config.app;

    log('Copy ' + src + ' to ' + dest);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(dest));
});

gulp.task('copy-fonts', function() {
    var src = config.fontsDir + '**/*';
    var dest = config.buildDir + config.fonts;

    log('Copy ' + src + ' to ' + dest);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(dest));
});

gulp.task('copy-images', function() {
    var src = config.imagesDir + '**/*';
    var dest = config.buildDir + config.images;

    log('Copy ' + src + ' to ' + dest);

    return gulp
        .src(src)
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(dest));
});

gulp.task('copy-config', function() {
    var src = config.configDir + '**/*';
    var dest = config.buildDir + config.config;

    log('Copy ' + src + ' to ' + dest);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(dest));
});

gulp.task('copy-root', function() {
    var src = config.srcDir + '*';
    var dest = config.buildDir;

    log('Copy ' + src + ' to ' + dest);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(dest));
});

gulp.task('copy-styles', function() {

    var src = config.stylesDir + '**/*.css';
    var dest = config.buildDir + config.styles;

    log('Copy ' + src + ' to ' + dest);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.flatten())
        .pipe(gulp.dest(dest));
});

gulp.task('inject-build', function() {
    var src = config.buildDir + config.index;
    var dest = config.buildDir;

    var base;
    if (args.prod) {
        base = config.baseUrlProd;
    }
    else {
        base = config.baseUrlTest;
    }

    log('Configure ' + src + ' for publish');

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.htmlReplace({
            base: base,
            system: config.systemScript,
            app: config.appScript
        }, {
            keepUnassigned: true,
            keepBlockTags: true,
            resolvePaths: false
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('serve-build', function() {
    log('Starting build http server');

    var cfg = {
        injectChanges: false,
        server: {
            port:3000,
            baseDir: './build',
            index: config.index,
            middleware: [
                logger({format: '%date %status %method %url'}),
                fallback({
                    index: '/index.html',
                    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'] // systemjs workaround
                })
            ]
        }
    };

    // Fixes browsersync error when overriding middleware array
    // https://github.com/johnpapa/lite-server/blob/master/lib/lite-server.js
    if (cfg.middleware) {
        cfg.middleware = _.compact(cfg.middleware);
    }

    browserSync.init(cfg);
});

gulp.task('serve-test', function() {
    log('Starting test http server');

    var cfg = {
        injectChanges: false,
        server: {
            port:3000,
            baseDir: './publish/test',
            index: config.index,
            middleware: [
                logger({format: '%date %status %method %url'}),
                fallback({
                    index: '/index.html',
                    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'] // systemjs workaround
                })
            ]
        }
    };

    // Fixes browsersync error when overriding middleware array
    // https://github.com/johnpapa/lite-server/blob/master/lib/lite-server.js
    if (cfg.middleware) {
        cfg.middleware = _.compact(cfg.middleware);
    }

    browserSync.init(cfg);
});

gulp.task('serve-prod', function() {
    log('Starting prod http server');

    var cfg = {
        injectChanges: false,
        server: {
            port:3000,
            baseDir: './publish/prod',
            index: config.index,
            middleware: [
                logger({format: '%date %status %method %url'}),
                fallback({
                    index: '/index.html',
                    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'] // systemjs workaround
                })
            ]
        }
    };

    // Fixes browsersync error when overriding middleware array
    // https://github.com/johnpapa/lite-server/blob/master/lib/lite-server.js
    if (cfg.middleware) {
        cfg.middleware = _.compact(cfg.middleware);
    }

    browserSync.init(cfg);
});

gulp.task('copy-publish', ['clean-publish'], function() {

    if (!checkPublishArgs()) { return; }

    var src = [
        config.buildDir + '**/*',
        '!' + config.buildDir + config.config + '{,/**}'];

    var dest;
    if (args.prod) {
        dest = config.publishProdDir;
    }
    else {
        dest = config.publishTestDir;
    }

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(dest));
});

gulp.task('clean-publish', function() {
    var src = config.publishDir + '**/*';
    return clean(src);
});

gulp.task('clean-publish-config', function() {
    var src = config.publishDir + '**/config/*';
    return clean(src);
});

gulp.task('config-publish', ['config-publish-system','config-publish-app']);

gulp.task('config-publish-system', function() {

    if (!checkPublishArgs()) { return; }

    var src;
    if (args.prod) {
        src = config.configDir + config.systemProdConfig;
    }
    else {
        src = config.configDir + config.systemTestConfig;
    }

    var dest;
    if (args.prod) {
        dest = config.publishProdDir + config.config;
    }
    else {
        dest = config.publishTestDir + config.config;
    }

    log('Config publish ' + src + ' --> ' + dest + config.systemConfig);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.rename(config.systemConfig))
        .pipe(gulp.dest(dest));
});

gulp.task('config-publish-app', function() {

    if (!checkPublishArgs()) { return; }

    var src;
    if (args.prod) {
        src = config.configDir + config.appProdConfig;
    }
    else {
        src = config.configDir + config.appTestConfig;
    }

    var dest;
    if (args.prod) {
        dest = config.publishProdDir + config.config;
    }
    else {
        dest = config.publishTestDir + config.config;
    }

    log('Config publish ' + src + ' --> ' + dest + config.appConfig);

    return gulp
        .src(src)
        .pipe($.plumber({
            errorHandler: error
        }))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.rename(config.appConfig))
        .pipe(gulp.dest(dest));
});

////////////////////////////////////////////////////////////////////////////////
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function error(err) {
    $.util.log($.util.colors.red(err));
    this.emit('end');
}

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function htmllintReporter(filepath, issues) {
    if (issues.length > 0) {
        issues.forEach(function (issue) {
            $.util.log(
                $.util.colors.cyan('[gulp-htmllint] ') +
                $.util.colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') +
                $.util.colors.red('(' + issue.code + ') ' + issue.msg));
        });

        process.exitCode = 1;
    }
}

function checkPublishArgs() {
    if (!args.test && !args.prod) {
        log($.util.colors.red('ERROR: Please specify publish: --prod or --test'));
        return false;
    }

    return true;
}

function clean(src) {
    log('Cleaning ' + src);
    return del(src);
}

