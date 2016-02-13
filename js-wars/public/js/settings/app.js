/* ---------------------------------------------------------------------------------------------------------*\
    
    app is a container and holds variables for all elements of the application 

\* ---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = {

    testing: true,
    games:[],

    // return an hsl string from either manual settings or object containing hsl values
    hsl:function(h,s,l) {
        var format = function (hue, saturation, lightness) {
            return 'hsl('+hue+','+saturation+'%,'+lightness+'%)';
        }
        if (!s && s !== 0) return format(h.h, h.s, h.l);
        return format(h,s,l);
    },

    // holds number of pixles to move elements on or off screen
    offScreen: 800,

    // target element to insert before
    domInsertLocation: document.getElementById('before'),

    // holds temporary shared variables, usually info on game state changes that need to be accessed globally
    temp:{},

    // holds previously selected elements for resetting to defaults
    prev:{},

    // holds default shared variables, usually info on game state changes that need to be accessed globally
    def: {
        category:0,
        menuOptionsActive:false,
        selectActive: false,
        cursorMoved: true,
        saturation:0,
        scrollTime: 0,
        lightness:50
    },

    users: [{
        co: 'sami',
        name: 'grant'
    }, {
        co: 'andy',
        name: 'steve'
    }],

    cache: {},
    keys: [], // holds array of key pressed events
    maps: [], // holds maps for selection

    key: {
        pressed: function (key) {
            if(key !== 'pressed'){
                 var code = app.key[key];
                 if(code) return app.keys.indexOf(code) !== -1;
            }
            return false;
        },
        esc: 27,
        enter: 13,
        up: 38,
        down: 40,
        left: 37,
        right: 39
    },

    // set custom animation repo if desired
    setAnimationRepo: function (repo) {
        this.animationRepo = repo;
        return this;
    }
};