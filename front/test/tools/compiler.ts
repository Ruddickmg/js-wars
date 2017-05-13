import babelify from "babelify";
import browserify from "browserify";
import fs from "fs";
import tsify from "tsify";
import uglify from "uglify-js";
import watchify from "watchify";

export interface Compiler {

    compile(pathToOutputFile: string): Compiler;
    tsify(options: object): Compiler;
    watchify(): Compiler;
    uglify(options: object): Compiler;
    babelify(options: object): Compiler;
}

export default function compiler(pathToInputFile: string): Compiler {

    const bundler = browserify({

        cache: {},
        entries: [pathToInputFile],
        packageCache: {},
        plugin: [watchify],
    });

    const compile = (pathToOutputFile: string): void => {

        bundler.bundle()
            .pipe(fs.createWriteStream(pathToOutputFile));
    };

    return {

        compile(pathToOutputFile: string): Compiler {

            compile(pathToOutputFile);

            return this;
        },
        tsify(options: object = {}): Compiler {

            bundler.plugin(tsify, options);

            return this;
        },
        watchify(): Compiler {

            bundler.on("update", compile);

            return this;
        },
        uglify(options: object = {}): Compiler {

            bundler.transform(uglify.minify, options);

            return this;
        },
        babelify(options: object): Compiler {

            bundler.transform(babelify, options);

            return this;
        },
    };
}
