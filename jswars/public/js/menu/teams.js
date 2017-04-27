/* --------------------------------------------------------------------------------------*\
    
    Teams.js controls co and team selection

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.key = require('../input/keyboard.js');
app.footer = require('../menu/footer.js');

Menu = require ('../menu/elements/menu.js');
Select = require('../tools/selection.js');
PlayerNumber = require('../menu/elements/playerNumber.js');
CoElement = require('../menu/elements/coElement.js');
PlayerElement = require('../menu/elements/playerElement.js');
TeamElement = require('../menu/elements/teamElement.js');
playerController = ("../controller/player.js");
aiPlayer = require('../user/aiPlayer.js');
Button = require('../objects/button.js');
transmit = require("../sockets/transmitter.js");

Teams = Object.create(Menu);
Teams.speed = 1.5;
Teams.players = [];
Teams.aiNumber = 0;

Teams.select = function () {

    if (!this.active()) {

        this.init();
    }

    this.coBorderColor();

    if (this.selectingCo()) {

        this.choseCo();
    
    } else if (this.selectingTeam()) {

        this.choseTeam();

    } else {

        return this.playerReady();
    }
};

Teams.view = function () {

    if (!this.active()) {

        this.init();
    }

    this.coBorderColor();

    if (app.key.pressed(app.key.esc())) {

        return this.remove();
    }
};

Teams.init = function () {

    var scope = this;

    this.display();
    this.activate();

    // initialize player properties
    app.players.all().map(function (player, index) {

        var element = scope.playerElement(index + 1);

        player = playerController.setProperty(player, 'mode', element.mode().value());

        return playerController.setProperty(player, 'co', element.co().value());
    });

    // create start button
    this.button = new Button('setupScreen', function () { app.game.start(); });

    if (this.arrows) {

        this.rise();
    }

    app.game.started() ? this.toTeam() : app.players.saved() ? this.toReady() : this.toCo();
};

Teams.selectableTeams = function (team) {

    var number = app.user.number();
    var teamNumber = team.number();

    return number === teamNumber ||
        number === 1 && Teams.playerElement &&
            Teams.playerElement(teamNumber).mode().isComputer();
};

Teams.selectable = function (element, index, elements) {

    var mode = elements[index + 1];
    var player = app.user.number();
    var number = element.number();

    return element.type() === 'co' ? player === number || 
        player === 1 && mode.isComputer() : player === 1;
};

Teams.top = function () { 

    return Number(this.screen().style.top.replace('px','')); 
};

Teams.selectingCo = function () { 

    return this.mode === 'co';
};

Teams.selectingTeam = function () { 

    return this.mode === 'team';
};

Teams.ready = function () { 

    return this.mode === 'ready';
};

Teams.booted = function () { 

    return this.bt; 
};

Teams.boot = function () {

    this.goBack();
};

Teams.toCo = function (from) {

    if (app.game.joined()) {

        transmit.getPlayerStates(app.map.category(), app.game.name(), app.game.id());
    }

    if (this.mode) {

        this.playersHeight('30%');
    }

    if (this.arrows) {

        this.arrows.setSpace(10).setPosition(this.elements.current()).show();
    }

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

    if (this.arrows) {

        this.arrows.setSpace(0).setPosition(this.teams.current()).show();
    }

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

    playerController.isReady(player, true);

    this.setMode('ready');

    transmit.ready(player); 

    this.playersHeight('20%');

    if (this.arrows) {

        this.arrows.setSpace(10).setPosition(this.elements.current()).hide();
    }

    app.chat.display();

    return this;
};

Teams.fromReady = function () {

    var player = app.user.player();

    playerController.isReady(player, false);

    transmit.ready(player);

    if (this.arrows) {

        this.arrows.hide();
    }

    app.chat.remove();

    app.key.undo();

    this.button.hide();

    return this;
};

Teams.setMode = function (mode) {

    this.mode = mode;
};

Teams.selectTeams = function () { 

    return app.map.players() > 2 || app.game.started(); 
};

Teams.choseCo = function () {

    var player, element, wasComputer, scope = this;

    if (app.key.pressed(['left','right'])) {

        element = Select.setHorizontal(Select.horizontal(this.elements.limit(this.selectable))).getHorizontal();
        
        this.selected = element.type();
        
        if (this.arrows) {

            this.arrows.setPosition(element);
        }
    }

    if (app.key.pressed(['up','down']) && !app.players.saved()) {

        wasComputer = Select.getHorizontal().isComputer();

        element = Select.setVerticle(Select.verticle(Select.getHorizontal().hide())).getVerticle().show();

        if (element.isComputer()) {

            if (!wasComputer) {

                this.addAiPlayer(element.number());
            }

        } else if (wasComputer) {

            this.removeAiPlayer(element.number());
        }
    }
    
    if (element && (player = app.players.number(element.number()))) {

        app.players.update(playerController.setProperty(player, element.type(), element.value()));
    }

    if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter())){

        this.selectTeams() ? this.fromCo().toTeam() : this.fromCo().toReady();
    
    } else if (app.key.pressed(app.key.esc())) return this.exit(this, function (scope) {

        scope.goBack();
    });
};

Teams.choseTeam = function () {

    var team;

    if (!app.game.started()) {

        if (app.key.pressed(['left', 'right'])) {

            team = Select.setHorizontal(Select.horizontal(this.teams).limit(this.selectableTeams)).getHorizontal();
            
            if (this.arrows) {

                this.arrows.setPosition(team);
            }
        }

        if (app.key.pressed(['up','down'])) {

            team = Select.verticle(Select.getHorizontal().hide()).show();
        }
            
        if (team) {

            app.players.number(team.number()).setProperty(team.type(), team.value());
        }

        if (app.key.pressed(app.key.esc()) || app.key.pressed(app.key.enter()) || this.booted()) {
            
            if(app.key.pressed(app.key.enter())) {

                return this.fromTeam().toReady();
            }

            this.fromTeam().toCo();

            app.key.undo();
        }
    }
};

Teams.playerReady = function (from) {

    app.players.ready() && (app.user.first() || app.players.saved()) ? 
        this.button.show() : this.button.hide();

    if (app.key.pressed(app.key.enter())) {

        app.chat.post(app.chat.send(app.chat.input()));
    }

    if (app.key.pressed(app.key.esc())) {

        if (app.players.saved()) {

            this.goBack();

        } else {

            this.selectTeams() ? this.fromReady().toTeam() : this.fromReady().toCo();
        }
    }
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
        if (!player && !mode.isComputer()) {

            element.toWhite();
        
        // if the player is ready or set to computer then make the border color solid
        } else if (mode.isComputer() || playerController.ready(player)) {

            element.toSolid();
            
        // if the player is not ready yet, but present then fade the color in and out
        } else if (player && !element.fading()) {

            element.fade();
        }
    }
};

Teams.playerElement = function (number) {

    if (this.playerElements) {

        return this.playerElements.getElement(number - 1);
    }
};

Teams.teamElement = function (number) {

    return this.teams.getElement(number - 1);
};

Teams.playersHeight = function (height, len) {

    var height = this.screenHeight() * this.percentage(height);

    for (var n = 1, len = app.map.players(); n <= len; n += 1) {

        this.playerElement(n).setTop(height);
    }
};

Teams.teamsHeight = function (height) {

    for (var n = 1, len = app.map.players(); n <= len; n += 1) {

        this.teamElement(n).setTop(height);
    }
};

Teams.showTeams = function () { 

    for (var n = 1, len = app.map.players(); n <= len; n += 1) {

        this.teamElement(n).show();
    }
};

Teams.hideTeams = function () {

    for (var n = 1, len = app.map.players(); n <= len; n += 1) {

        this.teamElement(n).hide();
    }
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

            player = playerController.setNumber(player, number);
            player = playerController.setProperty(player, co.type(), co.value());
            player = playerController.setProperty(player, mode.type(), mode.value());
        }

        playerElement.setMode(mode);
        playerElement.setCo(co);

        playerElement.add(mode.element());
        playerElement.add(co.element());

        if (this.selectTeams()) {

            var team = new TeamElement(number, size);

            if (!started && player) {

                player = playerController.setProperty(player, team.type(), team.value());
            }

            playerElement.add(team.element());
            teams.push(team);
        }

        element.appendChild(playerElement.element());
        players.push(playerElement);
        playerElement.show();
    }

    this.playerElements = new List(players);
    this.elements = new List(elements).limit(this.selectable);

    if (this.selectTeams()) {

        this.teams = new List(teams).limit(this.selectableTeams);
    }

    if (this.arrows) {

        this.arrows.setSize(30).setSpace(10).insert(element)
            .setPosition(this.elements.current()).fade();
    }
    
    this.selected = this.elements.current().type();

    if (!app.players.saved()) {

        Select.setHorizontal(this.elements);
    }

    screen.appendChild(element);

    return this.element = element;
};

Teams.remove = function () {

    var name, teams = this.element;

    this.deactivate();

    if (this.arrows) {

        this.arrows.remove();
    }

    delete this.arrows;
    delete this.mode;
    delete this.playerElements;

    if (app.game.started() || app.game.joined()) {

        this.screen().removeChild(teams);
    }
};

Teams.goBack = function () {

    this.remove();

    if (!app.game.joined()) {

        this.fall(function(){

            screen.removeChild(teams);
        });
    }

    if (app.players.length() < 2) {

        app.game.remove(app.players.saved() ? true : false);

        if (app.game.joined()) {

            app.game.setJoined(false);
            app.game.removeMap();
        }
    }
    
    app.players.reset();
    transmit.exit();
    app.input.goBack();
    this.setBack(true);
};

module.exports = Teams;