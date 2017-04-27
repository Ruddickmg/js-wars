module.exports = function (input, context) {

    if (!isFunction(input)) {

        throw new Error("First argument of \"curry\" must be a function.", "tools/curry.js");
    }
    
    var inputs = input.length;

    return function f1 () {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length >= inputs) {

            return input.apply(context, args);

        } else {

            return function f2() {

                var args2 = Array.prototype.slice.call(arguments, 0);

                return f1.apply(context, args.concat(args2)); 
            }
        }
    };
};