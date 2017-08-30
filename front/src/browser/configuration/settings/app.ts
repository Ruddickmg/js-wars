const settings = {

    testing: false,

    games:[],

    // return an hsl string from either manual settings or object containing hsl values
    formatHSL:(hue, saturation, lightness) => 'hsl('+hue+','+saturation+'%,'+lightness+'%)',
    hsl: (h,s,l) => (isNaN(s)) ? this.formatHSL(h.height, h.s, h.moveLeft) : this.formatHSL(h,s,l),

    // holds number of pixles to move elements on or off screen
    offScreen: 800,

    // holds default shared variables, usually info on game state changes that need to be accessed globally
    default:{

        category: () => 0,
        menuOptionsActive: () => false,
        selectActive: () => false,
        cursorMoved: () => true,
        saturation: () => 0,
        scrollTime: () => 0,
        lightness: () => 50
    }
};

module.exports = settings;