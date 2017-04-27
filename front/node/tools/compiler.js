"use strict";

const
    browserify = require('browserify'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    uglify = require('uglify-js'),
    fs = require('fs');

function compiler (path, inputFileName) {

    const
        pathToFile = (fileName) => `${path}/${fileName}`,
        bundler = browserify({
            entries: [pathToFile(inputFileName)],
            plugin: [watchify],
            packageCache: {},
            cache: {}
        }),
        compile = (outfileName) => {

            bundler.bundle()
                .pipe(fs.createWriteStream(pathToFile(outfileName)));
        };

    return {

        compile(outfileName){

            compile(outfileName);

            return this;
        },
        watchify() {

            bundler.on('update', compile);

            return this
        },
        uglify(options) {

            bundler.transform(uglify.minify, options);

            return this;
        },
        babelify(options) {

            bundler.transform(babelify, options);

            return this;
        }
    };
}

module.exports = compiler;