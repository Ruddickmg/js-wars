// intel

module.exports = {
    status: function () {
        // map name at top
        // graph showing units, units lost, bases, income and funds for each player
        // neutral base count at bottom
    },
    unit: function () {
        // graph showing hp, fuel and ammo for each unit, orders them by currently hovered over parameter (hp, fuel, ammo)
        // use select button to toggle lowest or highest at the top
    },
    rules: function () {
        // show settings and teams menus (non editable)
        app.display.rules(setupScreenElement, app.display.chatOrDescription());
        app.display.teams(setupScreenElement, app.display.chatOrDescription());
    },
    display: function () {
        // show intel menu options
        this.a = true;
    },
    evaluate: function () {
        this.a = false;
    },
    active: function () { return this.a; }
};