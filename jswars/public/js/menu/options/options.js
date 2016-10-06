app.settings = require('../../settings/game.js');

module.exports = {
    
    del: function () {
        app.optionsMenu.remove();
        app.undo.all();
        app.hud.show();
        app.coStatus.show();
        app.cursor.deleteMode(); 
    },

    yield: function () { app.yield.prompt('Are you sure you want to yeild? '); },
    exit: function () { app.exit.prompt('Are you sure you want to exit? '); },

    // fugure out how to activate scroll through on hover, then use that to coordinate selection
    // for music and visuals

    music: function () {        
        app.optionsMenu.remove();
        alert('no music yet');
    },
    visual: function () {
        app.optionsMenu.remove();
        alert('no visuals yet');
        var description = {
            A: 'View battle and capture animations.',
            B: 'Only view battle animations.',
            C: 'Only view player battle animations'
        }
    },

    // --------------------------------------------------------------
    
    evaluate: function () {
        var option, type = app.display.verticle().select(app.optionsMenu.list(), app.effect.highlightListItem).id
        if (type) {
            this.a = false;
            app.options[type]();
        }
    },

    display: function () {
        app.optionsMenu.remove();
        app.display.info(
            {
                del: { name: 'Delete' },
                yield: { name: 'Yield' },
                music: { name: 'Music' },
                visual: { name: 'Visual'},
                exit: { name: 'Leave' }
            },
            ['del', 'yield', 'music', 'visual', 'exit', 'name'],
            { section: 'optionsMenu', div: 'optionSelect' }
        );
        this.a = true;
    },

    active: function () { return this.a; },
    deactivate: function () {this.a = false; },
};