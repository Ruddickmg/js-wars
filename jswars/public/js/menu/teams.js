/* --------------------------------------------------------------------------------------*\
    
    Teams.js controls co and team selection

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
socket = require('../tools/sockets.js');
app.key = require('../input/keyboard.js');
app.maps = require('../controller/maps.js'); 
app.screens = require('../objects/screens.js');
app.dom = require('../tools/dom.js');
app.background = require("../controller/background.js");
app.footer = require('../objects/footer.js');
app.arrows = require('../objects/arrows');

Menu = require ('../objects/menu.js');
Settings = require('../menu/settings.js');
Select = require('../tools/selection.js');
PlayerNumber = require('../menu/elements/playerNumber.js');
CoElement = require('../menu/elements/coElement.js');
PlayerElement = require('../menu/elements/playerElement.js');
TeamElement = require('../menu/elements/teamElement.js');
AiPlayer = require('../objects/aiPlayer.js');

Teams = Object.create(Menu);
Teams.speed = 1.5;
Teams.players = [];
Teams.aiNumber = 0;
Teams.select = function () {
    if (!this.active()) this.init();
    this.coBorderColor();
    if (this.selectingCo()) this.choseCo();
    else if (this.selectingTeam()) this.choseTeam();
    else return this.playerReady();
};
Teams.view = function () {
    if (!this.active()) this.init();
    this.coBorderColor();
    if (app.key.pressed(app.key.esc())) 
        return this.remove();
};
Teams.init = function () {
    var scope = this;
    this.display();
    this.activate();
    app.players.all().map(function (player, index) {
        var element = scope.playerElement(index + 1);
        player.setProperty('mode', element.mode().value());
        player.setProperty('co', element.co().value());
    });
    if (this.arrows) this.rise();
    app.game.started() ? this.toTeam() : this.toCo();
};
Teams.selectableTeams = function (team) {
    var number = app.user.number();
    var teamNumber = team.number();
    return number === teamNumber || 
        number === 1 && Teams.playerElement && 
            Teams.playerElement(teamNumber).mode().isComputer();
};
Teams.selectable = function (element, index, elements) {
    var mode = elements[index + 1], player = app.user.number(), number = element.number();
    return element.type() === 'co' ? player === number || player === 1 && mode.isComputer() : player === 1;
};
Teams.top = function () { return Number(this.screen().style.top.replace('px','')); };
Teams.selectingCo = function () { return this.mode === 'co';};
Teams.selectingTeam = function () { return this.mode === 'team';};
Teams.ready = function () { return this.mode === 'ready';};
Teams.booted = function () { return this.bt; };
Teams.boot = function () {
    this.goBack();
    this.remove();
};
Teams.remove = function () {

    this.deactivate();

    if (this.arrows) {
        this.arrows.remove();
        delete this.arrows;
    }

    delete this.mode;
    delete this.playerElements;

    var name, screen = this.screen(), 
    teams = this.element;

    if (!app.game.joined()) 
        this.fall(function(){screen.removeChild(teams);});
    else screen.removeChild(teams);

    app.input.goBack();
    app.footer.remove();

    if (app.players.length() < 2) {
        app.maps.remove(app.map.name());
        socket.emit('removeRoom', {
            category:app.map.category(), 
            name: app.game.name()
        });
        app.game.clear();
    }
    if (!app.game.started()) 
        app.players.reset();
};
Teams.toCo = function (from) {
    if (app.game.joined()) {
        this.moveElements('up', this.element);
        socket.emit('getPlayerStates', {
            category: app.map.category(), 
            name: app.game.name()
        });
    }
    if (this.mode) this.playersHeight('30%');
    if (this.arrows) this.arrows.setSpace(10).setPosition(this.elements.current()).show();
    Select.setHorizontal(this.elements);
    this.setMode('co');
    this.sel = true;
    return this;
};
Teams.fromCo = function () {
    app.key.undo();
    this.setMode(this.selectTeams() ? 'team' :'ready');
    return this;
};
Teams.toTeam = function () {
    this.playersHeight('20%');
    this.teamsHeight(this.playerElement(1).bottom() / 1.5);
    this.showTeams();
    if (this.arrows) this.arrows.setSpace(0).setPosition(this.teams.current()).show();
    Select.setHorizontal(this.teams.limit(this.selectableTeams));
    this.setMode('team');
    return this;
};
Teams.fromTeam = function () {
    this.hideTeams();
    return this;
};
Teams.toReady = function () {
    var top, player = app.user.player();
    player.isReady(true);
    this.setMode('ready');
    socket.emit('ready', player);
    this.playersHeight('20%');
    if (this.arrows) this.arrows.setSpace(10).setPosition(this.elements.current()).hide();
    this.button = app.screens.startButton('setupScreen');
    app.chat.display();
    return this;
};
Teams.fromReady = function () {
    var player = app.user.player();
    player.isReady(false);
    socket.emit('ready', player);
    if (this.arrows) this.arrows.hide();
    app.chat.remove();
    app.key.undo();
    this.button.remove();
    return this;
};
Teams.setMode = function (mode) {this.mode = mode;};
Teams.selectTeams = function () { return app.map.players() > 2 || app.game.started(); };
Teams.choseCo = function () {

    var player, element, wasComputer, scope = this;

    if (app.key.pressed(['left','right'])) {
        element = Select.setHorizontal(Select.horizontal(this.elements.limit(this.selectable))).getHorizontal();
        this.selected = element.type();
        if (this.arrows) this.arrows.setPosition(element);
    }

    if (app.key.pressed(['up','down'])) {
        wasComputer = Select.getHorizontal().isComputer();
        element = Select.setVerticle(Select.verticle(Select.getHorizontal().hide())).getVerticle().show();

        if (element.isComputer()) {
            if(!wasComputer) this.addAiPlayer(element.number());
        } else if (wasComputer) this.removeAiPlayer(element.number());
    }
    
    if (element && (player = app.players.number(element.number())))
        player.setProperty(element.type(), element.value());

    if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
        this.selectTeams() ? this.fromCo().toTeam() : this.fromCo().toReady();
    else if (app.key.pressed(app.key.esc())) return this.exit(this, function (scope) {
        scope.goBack();
        scope.remove();
    });
};
Teams.choseTeam = function () {
    if (!app.game.started()) {
        if (app.key.pressed(['left', 'right'])) {
            var team = Select.setHorizontal(Select.horizontal(this.teams).limit(this.selectableTeams)).getHorizontal();
            if (this.arrows) this.arrows.setPosition(team);
        }
        if (app.key.pressed(['up','down'])) var team = Select.verticle(Select.getHorizontal().hide()).show();
            
        if (team) app.players.number(team.number()).setProperty(team.type(), team.value());

        if (app.key.pressed(app.key.esc()) || app.key.pressed(app.key.enter()) || this.booted()) {
            if(app.key.pressed(app.key.enter()))
                return this.fromTeam().toReady();
            this.fromTeam().toCo();
            app.key.undo();
        }
    }
};
Teams.playerReady = function (from) {
    app.players.ready() && app.user.first() ? this.button.show() : this.button.hide();

    if (app.game.started()) {
        this.remove();
        return app.players.all();
    }

    if (app.key.pressed(app.key.enter())) 
        app.chat.post(app.chat.send(app.chat.input()));

    if (app.key.pressed(app.key.esc()))
        this.selectTeams() ? this.fromReady().toTeam() : this.fromReady().toCo();
};
Teams.coBorderColor = function () {

    // move through the spaces and check the status of the players, change their border color
    // to indicate whether they are ready to go or not
    for (var number = 1, len = app.map.players(); number <= len; number += 1) {

        // get the player element
        var element = this.playerElement(number);

        // get player
        var player = app.players.number(number);

        // check the mode, if it is cp then it should display a solid border color
        var mode = element.mode();
        
        // if the  space is not occupied then make the background white
        if (!player && !mode.isComputer()) element.toWhite();
        
        // if the player is ready or set to computer then make the border color solid
        else if (mode.isComputer() || player.ready()) element.toSolid();
            
        // if the player is not ready yet, but present then fade the color in and out
        else if (player && !element.fading()) element.fade();
    }
};
Teams.playerElement = function (number) {if (this.playerElements) return this.playerElements.getElement(number - 1);};
Teams.teamElement = function (number) {return this.teams.getElement(number - 1);};
Teams.playersHeight = function (height, len) {
    var height = this.screenHeight() * this.percentage(height);
    for (var n = 1, len = app.map.players(); n <= len; n += 1)
        this.playerElement(n).setTop(height);
};
Teams.teamsHeight = function (height) {
    for (var n = 1, len = app.map.players(); n <= len; n += 1)
        this.teamElement(n).setTop(height);
};
Teams.showTeams = function () { 
    for (var n = 1, len = app.map.players(); n <= len; n += 1)
        this.teamElement(n).show();
};
Teams.hideTeams = function () {
    for (var n = 1, len = app.map.players(); n <= len; n += 1)
        this.teamElement(n).hide();
};
Teams.addAiPlayer = function (number) {
    var player = app.players.number(number), n = (this.aiNumber += 1);
    player = player ? app.players.replace(player, n) : app.players.add(new AiPlayer(n));
};
Teams.removeAiPlayer = function (number) {
    app.players.remove(app.players.number(number));
    this.selected = Select.setHorizontal(this.elements.limit(this.selectable)).getHorizontal().type();
};
Teams.display = function () {

    var screen = this.createScreen('setupScreen');
    var elements = [], teams = [], players = [], size = 200;

    var element = document.createElement('article');
    element.setAttribute('id','teams');

    var footer = app.footer.display(screen).parentNode
    screen.appendChild(footer);
    this.createTitle('Teams');

    var chatScreen = document.getElementById('descriptionOrChatScreen');
    var chat = app.input.form('chat', chatScreen, 'type here to chat with other players');
    chatScreen.appendChild(chat);

    var height = (screen.offsetHeight * .3) + (this.arrows ? app.offScreen : 0), started = app.game.started();

    for (var co, player, playerElement, mode, number = 1, nop = app.map.players(); number <= nop; number += 1) {

        playerElement = new PlayerElement(number, size, height);
        player = app.players.number(number);

        elements.push((co = new CoElement(number, player ? player.co : number - 1)).setBorder(5));
        elements.push((mode = new PlayerNumber(number, size, player ? player.mode : 0)).setBorder(5));

        this.players[co.id()] = co.properties();
        this.players[mode.id()] = mode.properties();

        if (!started && player) {
            player.setNumber(number);
            player.setProperty(co.type(), co.value());
            player.setProperty(mode.type(), mode.value());
        }
        playerElement.setMode(mode);
        playerElement.setCo(co);

        playerElement.add(mode.element());
        playerElement.add(co.element());

        if (this.selectTeams()) {
            var team = new TeamElement(number, size);
            if (!started && player) player.setProperty(team.type(), team.value());
            playerElement.add(team.element());
            teams.push(team);
        }
        element.appendChild(playerElement.element());
        players.push(playerElement);
        playerElement.show();
    }
    this.playerElements = new List(players);

    this.elements = new List(elements).limit(this.selectable);
    if (this.selectTeams()) this.teams = new List(teams).limit(this.selectableTeams);
    if (this.arrows) this.arrows.setSize(30).setSpace(10).insert(element).setPosition(this.elements.current()).fade();
    
    this.selected = this.elements.current().type();
    Select.setHorizontal(this.elements);
    screen.appendChild(element);
    return this.element = element;
};
module.exports = Teams;