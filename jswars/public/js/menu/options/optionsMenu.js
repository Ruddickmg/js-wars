/* ----------------------------------------------------------------------------------------------------------*\
    
    app.options handles the in game options selection, end turn, save etc.
    
\* ----------------------------------------------------------------------------------------------------------*/

app = require("../../settings/app.js");
app.game = require("../../game/game.js");
app.settings = require("../../settings/game.js");
app.players = require("../../controller/players.js");
app.save = require("./save.js");
socket = require("../../tools/sockets.js");

Exit = require("./exit.js");
UList = require("../elements/ul.js");
Settings = require("../settings.js");
app.key = require("../../input/keyboard.js");

Options = Object.create(UList.prototype);
Options.subMenus = ["rules", "exit", "yield", "save", "status", "unit"];
Options.ruleMenus = [Settings, Teams];
Options.ri = 0;

/* ------=======------ helpers -------=====------ *\
\* -----------------------------------------------*/

Options.hidden = function () {return this.hid;};
Options.deactivate = function () {this.a = false;};
Options.active = function () {return this.a; };
Options.activate = function () {this.a = true;};
Options.screen = function () { return this.s; };
Options.setScreen = function (s) {this.s = s;};
Options.setMode = function (mode) {this.m = mode; return this;};
Options.mode = function () {return this.m;};
Options.screen = function () { return document.getElementById("optionsMenu"); };
Options.leaveGame = function (callback) {
    if (!this.leave) {
        this.leave = new Exit(callback).prompt("Are you sure you want to "+this.mode()+"? ");
        this.hide();
    } else if (this.leave.evaluate()) {
        this.leave = false;
        app.screen.reset();
        this.remove();
    }
};
Options.remove = function () {
    this.setMode(false);
    this.show();
    var menu = this.screen();
    if (menu) menu.parentNode.removeChild(menu);
};
Options.init = function (properties, allowed, elements) {
    this.activate();
    this.parent = app.dom.createMenu(properties, allowed, elements);
    this.selected = this.setElement(this.parent.firstChild).setIndex(0).highlight().id();
    return this;
};
Options.select = function() { 
    if (!this.hidden()) {
        if (app.key.pressed(["up", "down"])) 
            this.selected = Select.verticle(this.deHighlight()).highlight().id();

        if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
            this[this.setMode(this.selected).mode()]();
    }
};
Options.subMenu = function () {
    var mode = this.mode();
    return this.subMenus.find(function (option) { return mode === option; });
};
Options.hide = function () { 
    this.parent.style.display = "none"; 
    this.hid = true; 
    return this;
};
Options.show = function () { 
    this.parent.style.display = null; 
    this.hid = false; 
    return this;
};

/* ------=======------ main menus -------=====------ *\
\* --------------------------------------------------*/

Options.display = function () {
    this.init(
        app.settings.optionsMenu, 
        app.settings.optionsMenuDisplay, 
        { section: "optionsMenu", div: "optionSelect" }
    );
    return this;
};


Options.co = function () { app.screen.reset(); };
Options.save = function () { 
    if (!app.save.active()) {
        this.hide();
        app.save.display();
    } else if (app.save.evaluate()) {
        app.save.deactivate();
        this.remove();
        app.screen.reset();
    }
};
Options.end = function () {
    var player = app.players.current();
    player.endTurn();
    if (app.user.player() === player) {
        app.screen.reset();
        app.animate(["cursor"]);
        socket.emit("endTurn", player.id());
    }
    return this;
};

/* ------=======------ option menus -------=====------ *\
\* ----------------------------------------------------*/

Options.options = function () { 
    this.init(
        {
            del: { name: "Delete" },
            yield: { name: "Yield" },
            music: { name: "Music" },
            visual: { name: "Visual"},
            exit: { name: "Leave" }
        },
        ["del", "yield", "music", "visual", "exit", "name"],
        { section: "optionsMenu", div: "optionSelect" }
    ); 
};
Options.del = function () {
    this.remove();
    app.screen.reset();
    app.hud.show();
    app.coStatus.show();
    app.cursor.deleteMode(); 
};
Options.yield = function () {
    this.leaveGame(function () {
        app.game.end();
        var player = app.user.player();
        socket.emit("defeat", {defeated:player, conqueror:player, capturing:false});
    })
};
Options.music = function () {        
    this.remove();
    alert("no music yet");
};
Options.visual = function () {
    this.remove();
    alert("no visuals yet");
    var description = {
        noVisual: "No visuals.",
        A: "View battle and capture animations.",
        B: "Only view battle animations.",
        C: "Only view player battle animations."
    }
};
Options.exit = function () { this.leaveGame(); };


/* ------=======------ intel menus -------=====------ *\
\* ---------------------------------------------------*/

Options.intel = function () {
    this.init(
        {
            rules: { name: "Rules" },
            status: { name: "Status" },
            unit: { name: "Unit" }
        },
        ["rules", "status", "unit", "name"],
        { section: "optionsMenu", div: "optionSelect" }
    );
};
Options.status = function () {
    // map name at top
    // graph showing units, units lost, bases, income and funds for each player
    // neutral base count at bottom
},
Options.unit = function () {
    // graph showing hp, fuel and ammo for each unit, orders them by currently hovered over parameter (hp, fuel, ammo)
    // use select button to toggle lowest or highest at the top
},

Options.ruleIndex = function () {return this.ri + 1 < this.ruleMenus.length ? (this.ri += 1) : (this.ri = 0);};
Options.rules = function () {
    if ((app.key.pressed(app.key.enter()) || !this.hidden())) {

        if (!this.hidden()) this.hide();
        else this.currentMenu.remove();
        (this.currentMenu = this.ruleMenus[this.ruleIndex()]).select();

    } else if (app.key.pressed(app.key.esc())) {

        this.currentMenu.remove();
        var ii = document.getElementById("setupScreen");
        ii.parentNode.removeChild(ii);
        this.show().setMode("intel").intel();

    }
};
module.exports = Options;