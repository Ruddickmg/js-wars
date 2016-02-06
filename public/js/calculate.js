/* ----------------------------------------------------------------------------------------------------------*\
    
    app.calculate handles the more intense calculations like pathfinding and the definition of movement range
\* ----------------------------------------------------------------------------------------------------------*/

app.calculate = function () {

    var abs = Math.abs;
    var floor = Math.floor;
    var random = Math.random;
    var round = Math.round;

    var findTerrain = function (unit){
        terrain = app.map.terrain;
        for ( t = 0; t < terrain.length; t += 1){
            if(terrain[t].x === unit.x && terrain[t].y === unit.y){
                return terrain[t];
            }
        }
        return false;
    };

    var rand = function(){return floor((random() * 9) + 1)};

    var calcDamage = function (attacked, attacker) {
        var r = rand();
        var baseDamage = attacker.baseDamage[attacked.type];
        var coAttack = app.temp.player.co.attack(attacker);
        var coDefense = app.players[attacked.player - 1].co.defense(attacked);
        var terrainDefense = findTerrain(attacked).def;
        terrainDefense = !terrainDefense ? 1 : terrainDefense;
        var defenderHP = attacked.health;
        var attackerHP = attacker.health;
        return round((abs(baseDamage * coAttack/100 + r) * (attackerHP/10) * abs((200-(coDefense + terrainDefense * defenderHP))/100)));
    };

    var attackRange = function () {

    };

    // create a range of movement based on the unit allowed square movement
    var movementCost = function (origin, x, y) {

        // calculate the difference between the current cursor location and the origin, add the operation on the axis being moved on
        return abs((origin.x + x) - origin.x) + abs((origin.y + y) - origin.y);
    };

    // calculate true offset location considering movement and position
    var offset = function (off, orig) {
        var ret = [];
        var inRange = function (obj) {
            if (abs(obj.x - orig.x) + abs(obj.y - orig.y) <= orig.movement && obj.x >= 0 && obj.y >= 0) {
                return true;
            }
            return false;
        };

        // if the selected unit can move on the terrain ( obsticle ) then calculate the offset
        if (orig.movable.hasValue(off.obsticle)) {
            var opX = off.x < orig.x ? -1 : 1;
            var opY = off.y < orig.y ? -1 : 1;
            var x = (orig.x + (orig.movement * opX) - (off.cost * opX) + opX);
            var y = (orig.y + (orig.movement * opY) - (off.cost * opY) + opY);
            var objX = {
                x: x,
                y: off.y
            };
            var objY = {
                x: off.x,
                y: y
            };
            if (inRange(objX)) ret.push(objX);
            if (inRange(objY)) ret.push(objY);
        } else {
            // otherwise add the specific location of the obsticle to the offset array 
            ret.push({
                x: off.x,
                y: off.y
            }); // check this if issues with unit offset, could be faulty method of dealing with this problem
        }
        return ret;
    };

    // detect if a square is an obsticle
    var findObsticles = function (x, y) {

        // loop over obsticle types
        for (var ot = 0; ot < app.settings.obsticleTypes.length; ot += 1) {

            // check if the currently examined grid square is one of the obsticle types
            var obs = app.select.hovered(app.settings.obsticleTypes[ot], x, y);

            // if it is and has a cost etc.. then return it
            if (obs.stat === true) {
                return app.map[obs.objectClass][obs.ind];
            }
        }
    };

    var pathfinder = function (orig, dest, grid, mode) {
        var mov = orig.movement;
        var ret = [];
        var open = [grid[0]];
        var closed = [];
        var index = 0;
        var neighbor, opi, x, y, cur;

        var cleanGrid = function (g) {
            var del = ['ind', 'p', 'f', 'g', 'visited', 'close'];
            for (var a = 1; a < g.length; a += 1) {
                for (var b = 0; b < del.length; b += 1) {
                    delete g[a][del[b]];
                }
            }
        };

        var getNeighbors = function (c) {
            var x = c.x;
            var y = c.y;
            var g, gpx, gpy;
            var neighbors = [];
            for (var l = 0; l < grid.length; l += 1) {
                g = grid[l];
                gpx = abs(g.x - x);
                gpy = abs(g.y - y);
                if (gpx < 2 && gpy < 2 && gpx !== gpy) {
                    neighbors.push(g);
                }
            }
            if (mode === undefined) {}
            return neighbors;
        };

        var inOpen = function (id) {
            for (var o = 0; o < open.length; o += 1) {
                if (open[o].id === id) return o;
            }
            return false;
        };

        var dist = function (c) {
            var dx1 = c.x - dest.x;
            var dy1 = c.y - dest.y;
            var dx2 = orig.x - dest.x;
            var dy2 = orig.y - dest.y;
            var cross = abs(dx1 * dy2 - dx2 * dy1);
            return ((abs(c.x - dest.x) + abs(c.y - dest.y)) + (cross * 0.001));
        };
        
        while (open[0]) {
            
            // set the current starting point to the point closest to the destination
            for (var f = 0; f < length; f += 1) {
                if (open[f].f < open[index]) {
                    index = f;
                }
            }

            cur = open[index];
            closed = closed.concat(open.splice(index, 1));
            grid[cur.ind].close = true;

            // if the destination has been reached, return the array of values
            if (dest.x === cur.x && dest.y === cur.y) {
                ret = [cur];
                while (cur.p) {
                    for (var c = 0; c < closed.length; c += 1) {
                        if (cur.p === closed[c].id) {
                            cur = closed[c];
                            ret.push(cur);
                        }
                    }
                }
                if (ret.length <= mov + 1) {
                    cleanGrid(grid);
                    if (mode === undefined) {
                        return ret;
                    }
                    return undefined;
                }
            }

            n = getNeighbors(cur);

            for (var i = 0; i < n.length; i += 1) {

                neighbor = n[i]; // current neighboring square
                cost = cur.g + neighbor.cost;

                if (neighbor.close) continue; // if the neghboring square has been inspected before then ignore it
                if (cost > mov) continue; // if the cost of moving to the neighboring square is more then allowed then ignore it

                // check to see if the currently inspected square is in the open array, return the index if it is
                opi = inOpen(neighbor.id);

                // if the current square is in the open array and a better position then update it
                if (opi && neighbor.g > cur.g) {
                    open[opi].g = cost; // distance from start to neighboring square
                    open[opi].f = cost + neighbor.h; // distance from start to neighboring square added to the distance from neighboring square to destination
                    open[opi].p = cur.id;

                    // if the neighboring square hasent been encountered add it to the open list for comparison
                } else if (neighbor.ind === undefined) {
                    n[i].g = cost; // distance from start to neighboring square
                    n[i].h = cost + dist(neighbor, dest); // distance from neighboring to destination
                    n[i].ind = i; // save the index to help with future identification of this neighboring square
                    n[i].p = cur.id; // add the current square as this neighboring squares parent
                    open.push(n[i]); // add the neighboring square to the open list for further comparison
                }
            }
        }
        cleanGrid(grid); // clean all assigned variables from grid so they wont interfier with future path finding in a loop
        if (mode !== undefined) { // if the goal is to tell if a path can be reached or not, and it couldnt be reached

            // return the destination as an unreachable location
            return dest;
        }
    };

    // calculate the movement costs of terrain land marks etc..
    var evaluateOffset = function (origin, dest, grid) {

        var range = [];

        for (var i = 0; i < dest.length; i += 1) {

            var g = grid.slice(0);

            var path = pathfinder(origin, dest[i], g, 'subtract');

            if (path) range.push(path);
        }

        return range;
    };

    // check which side of the screen the cursor is on
    var checkSide = function (axis) {
        var d = app.cursorCanvas.dimensions();
        var m = axis === 'x' ? d.width / 64 : d.height / 64; // screen width
        var x = app.settings.cursor.scroll[axis]; // map position relative to scroll
        if (app.settings.cursor.x > (m / 2) + x) return true;
        return false;
    };

    // calculate income
    var calcIncome = function (player) {

        // get the amount of income per building for current game
        var income = app.settings.income;
        var owner, count = 0;
        var buildings = app.map.building; // buildings list

        for (var b = 0; b < buildings.length; b += 1) {

            // count the number of buildings that belong to the current player
            if (buildings[b].player === player) {
                count += 1;
            }
        }
        // return the income ( amount of buildings multiplied by income per building set for game )
        return count * income;
    };

    return {

        damage: function (attacked, attacker) {
            attacker = !attacker ? app.temp.selectedUnit : attacker;
            return calcDamage( attacked, attacker );
        },

        // finds path
        path: function (orig, dest, grid, mode) {
            return pathfinder(orig, dest, grid, mode);
        },

        // returns cursor location ( left or right side of screen )
        side: function (axis) {
            if (checkSide(axis)) return 'right';
            return 'left';
        },

        // calculate income
        income: function (player) {
            return calcIncome(player.id);
        },

        // find range of allowed movement over variable terrain
        range: function () {

            if (app.temp.selectedUnit) {

                var id = 0; // id for grid point identificaion;
                var range = [];
                var offs = [];
                var selected = app.temp.selectedUnit;

                // amount of allotted movement for unit
                var len = selected.movement;

                // loop through x and y axis range of movement
                for (var ex = -len; ex <= len; ex += 1) {
                    for (var wy = -len; wy <= len; wy += 1) {

                        // if movement cost is less then or eual to the allotted movement then add it to the range array
                        if (movementCost(selected, ex, wy) <= selected.movement) {

                            // incremient id
                            id += 1;

                            // add origin to range of movement values
                            var x = selected.x + ex;
                            var y = selected.y + wy;

                            // locate obsticles                                 
                            var obsticle = findObsticles(x, y);

                            if (obsticle !== undefined) {

                                // get the number of offset movement from the obsticle based on unit type and obsticle type
                                var obsticleOffset = app.settings.obsticleStats[obsticle.obsticle][app.temp.selectedUnit.type];

                                if (obsticleOffset !== undefined) {
                                    if (selected.x === x && selected.y === y) {
                                        range.unshift({
                                            x: x,
                                            y: y,
                                            cost: 0,
                                            g: 0,
                                            f: 0,
                                            ind: 0,
                                            id: id,
                                            type: 'highlight'
                                        });
                                    } else {
                                        // make an array of obsticleOffset values, starting point, plus movement, and the amount of obsticleOffset beyond that movement
                                        obsticle.cost = obsticleOffset;
                                        obsticle.id = id;
                                        range.push(obsticle);
                                        offs = offs.concat(offset(obsticle, selected));
                                    }
                                }
                            } else {
                                range.push({
                                    x: x,
                                    y: y,
                                    cost: 1,
                                    id: id,
                                    type: 'highlight'
                                });
                            }
                        }
                    }
                }
                return range.offsetArray(evaluateOffset(selected, offs, range));
            }
            return false;
        }
    };
}();
