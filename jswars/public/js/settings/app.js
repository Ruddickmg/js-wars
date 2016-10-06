/* ---------------------------------------------------------------------------------------------------------*\
    
    App.js is a container and holds variables for all elements of the application 

\* ---------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = {

    testing: false,
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

    // holds cache for drawings <-- move to draw?
    cache: {},

    // set custom animation repo if desired
    setAnimationRepo: function (repo) {
        this.animationRepo = repo;
        return this;
    }
};