import babelify = require("babelify");
import browserify = require("browserify");
import fs = require("fs");
import tsify = require("tsify");
import uglify = require("uglify-js");
import watchify = require("watchify");

import notifications, {PubSub} from "./pubSub";

export interface Compiler {

    compile(pathToOutputFile: string, options: Options): Compiler;
    tsify(options: Options): Compiler;
    watchify(): Compiler;
    uglify(options: Options): Compiler;
    babelify(options: Options): Compiler;
}

interface Options {

    [option: string]: string | string[] | boolean;
}

export default function compiler(pathToInputFile: string): Compiler {

    let output: string;
    let globalOptions: Options;

    const errorEventId: string = "error";
    const {publish}: PubSub = notifications();
    const bundler = browserify({

        cache: {},
        debug: true,
        entries: [pathToInputFile],
        packageCache: {},
        plugin: [watchify],
    });

    const reportErrors = (bundle: any): any => {

        return bundle.on("error", (error: Error): any => {

            publish(errorEventId, Error(`Compiler Error: ${error.message}`));
        });
    };

    const compile = (pathToOutputFile: string, options: Options = {}): void => {

        let bundle = bundler.bundle();

        if (options.debug) {

            bundle = reportErrors(bundle);
        }

        bundle.pipe(fs.createWriteStream(pathToOutputFile));
    };

    return {

        compile(pathToOutputFile: string, options?: Options): Compiler {

            globalOptions = options;
            output = pathToOutputFile;

            compile(pathToOutputFile, options);

            return this;
        },
        tsify(options: Options = {}): Compiler {

            bundler.plugin(tsify, options);

            return this;
        },
        watchify(): Compiler {

            bundler.on("update", () => compile(output, globalOptions));

            return this;
        },
        uglify(options: Options = {}): Compiler {

            bundler.transform(uglify.minify, options);

            return this;
        },
        babelify(options?: Options): Compiler {

            bundler.transform(babelify.configure(options));

            return this;
        },
    };
}
