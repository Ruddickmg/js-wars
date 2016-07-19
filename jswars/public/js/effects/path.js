Position = require('../objects/position.js');
Heap = require('../tools/binaryHeap.js');

var Path = function () {this._coordinates = [];};

Path.prototype.size = function () { return this._coordinates.length; };
Path.prototype.clear = function () { return this._coordinates = []; };
Path.prototype.set = function (p) { return (this._coordinates = this._coordinates.concat(p)); };
Path.prototype.get = function () { return this._coordinates; };
Path.prototype.getNeighbors = function (position, check) {

    var x = position.x, y = position.y,
    neighbors = [],
    positions = [
        new Position(x - 1, y),
        new Position(x + 1, y),
        new Position(x, y - 1),
        new Position(x, y + 1)
    ];

    for (var n, i = 0; i < 4; i += 1){

        neighbor = app.map.top(positions[i]);

        if(neighbor && !neighbor.closed)
            neighbors.push(neighbor);
    }

    return neighbors;
};

Path.prototype.distance = function (position, target, origin) {
    var dx1 = position.x - target.x;
    var dy1 = position.y - target.y;
    var dx2 = origin.x - target.x;
    var dy2 = origin.y - target.y;
    var cross = Math.abs((dx1 * dy2) - (dx2 * dy1));
    var rand = Math.floor(Math.random()+1)/(1000);
    return ((Math.abs(dx1) + Math.abs(dy1)) + (cross * rand));
};

Path.prototype.reachable = function (unit, clean, movement) {

    var reachable = [unit], open = new Heap('f'), allowed = movement || unit.movement(), 
    neighbor, neighbors, current, cost;
    open.push(unit);
    app.map.close(unit);

    while (open.size()) {

        current = open.pop();

        neighbors = this.getNeighbors(current.position(), unit);

        for (var i = 0; i < neighbors.length; i += 1) {

            neighbor = neighbors[i];

            cost = (current.f || 0) + unit.moveCost(neighbor);

            // if the currentrent square is in the open array and a better position then update it
            if (cost <= allowed) {
                neighbor.f = cost;
                app.map.close(neighbor);
                reachable.push(neighbor);
                open.push(neighbor);
            } 
        }
    }
    return clean ? app.map.clean(reachable) : reachable;
};

Path.prototype.find = function (unit, target) {

    var allowed = unit.movement(), clean = [unit], cost, neighbor, i, neighbors, position, current,
    open = new Heap('f'); 
    app.map.close(unit);
    open.push(unit);
 
    while (open.size()) {

        current = open.pop();
        position = current.position();

        // if the targetination has been reached, return the array of values
        if (target.x === position.x && target.y === position.y) {
            var path = [current];
            while (current.p) path.unshift((current = current.p));
            app.map.clean(clean);
            return this.set(path);
        }

        neighbors = this.getNeighbors(position);

        for (i = 0; i < neighbors.length; i += 1) {

            neighbor = neighbors[i]; // current neighboring square

            cost = (current.g || 0) + unit.moveCost(neighbor);

            // if the currentrent square is in the open array and a better position then update it
            if (cost <= allowed && (!neighbor.g || neighbor.g >= current.g)) {
                neighbor.g = cost; // distance from start to neighboring square
                neighbor.f = cost + this.distance(neighbor.position(), target, unit.position()); // distance from start to neighboring square added to the distance from neighboring square to target
                neighbor.p = current; //<--- keep reference to parent
                app.map.close(neighbor);
                clean.push(neighbor);
                open.push(neighbor);
            }
        }
    }
    app.map.clean(clean);
    return false;
};

Path.prototype.show = function (effect) { app.animate('effects'); };

module.exports = Path;