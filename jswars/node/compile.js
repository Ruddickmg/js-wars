/* ----------------------------------------------------------------------------------------------------------*\

    impliment browserify and uglify or watchify depending on production or development

\* ----------------------------------------------------------------------------------------------------------*/

module.exports = function (root) {

    var watchify = require('watchify');
    var uglify = require('uglify-js');
    var fs = require('fs');
    var browserify = require('browserify');

    var sourceFile = root+'/public/js/main.js'; // sourceFile file
    var outFile = root+'/public/js/js-wars.js'; // output file

    return function (booly) {

        if (booly) { // if in developement mode

            console.log('  - Compiling and watching for code changes');

            // initialize browserify with the watchify plugin
            var b = browserify({ 
                entries: [sourceFile],
                cache: {},
                packageCache: {},
                plugin: [watchify]
            });

            // combine the required files into an ouput file
            var bundle = function () { b.bundle().pipe(fs.createWriteStream(outFile)); };

            var log = function (log) {console.log(log);};

            // if any required files have been edited then bundle them
            b.on('update', bundle);
            //b.on('log', log);

            // bundle files
            bundle();

        }else{

            console.log('  - Combining, mangling and compressing code');

            var b = browserify();

            // // add input file
            b.add(sourceFile);

            // // combine required files into output file
            b.bundle().pipe(fs.createWriteStream(outFile));

            // minify, compress, and mangle the output file after it has been bundled
            setTimeout(function () {
                var result = uglify.minify(outFile, {mangle:true,compress:true});
                fs.writeFileSync(outFile, result.code);
            }, 300);
        }
    };
};