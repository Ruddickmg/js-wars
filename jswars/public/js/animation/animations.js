/* --------------------------------------------------------------------------------------------------------*\

    default object animation repo, the 'm' parameter is a method passed from 
    app.draw that scales the coordinates of the drawings to fit any grid square size, as 
    well as providing some functionality like random(), which generates random numbers within the specified 
    range of numbers. 
    'm' does not have to be used
    default is a base of 64 ( 64 X 64 pixles ), the base is set as a perameter of initializing the 
    app.draw();

\*---------------------------------------------------------------------------------------------------------*/

module.exports = function (width, height) {
    var transparent = false;
    return {
        
        hide: function () {transparent = 0.1;},
        cursor: function (canv, m) {
            // size of cursor corners
            var size = 15;
            canv.strokeStyle = "black";
            canv.fillStyle = "#fff536";
            canv.beginPath();
            // bottom left
            canv.moveTo(m.l(3), m.u(size));
            canv.lineTo(m.l(3), m.d(3));
            canv.lineTo(m.r(size), m.d(3));
            canv.lineTo(m.l(3), m.u(size));
            // bottem right
            canv.moveTo(m.r(67), m.u(size));
            canv.lineTo(m.r(67), m.d(3));
            canv.lineTo(m.r(64 - size), m.d(3));
            canv.lineTo(m.r(67), m.u(size));
            // top right
            canv.moveTo(m.r(67), m.u(64 - size));
            canv.lineTo(m.r(67), m.u(67));
            canv.lineTo(m.r(64 - size), m.u(67));
            canv.lineTo(m.r(67), m.u(64 - size));
            // bottem left
            canv.moveTo(m.l(3), m.u(64 - size));
            canv.lineTo(m.l(3), m.u(67));
            canv.lineTo(m.r(size), m.u(67));
            canv.lineTo(m.l(3), m.u(64 - size));
            canv.fill();
            canv.stroke();
            return canv;
        },

        movementRange: function (canv, m) {
            canv.fillStyle = "rgba(255,255,255,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        attackRange: function (canv, m) {
            canv.fillStyle = "rgba(240,5,0,0.4)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        target: function (canv, m) {
            canv.fillStyle = "rgba(0,255,0,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        pointer: function (canv, m) {
            canv.fillStyle = "rgba(255,143,30,0.3)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        path: function (canv, m) {
            canv.fillStyle = "rgba(255,0,0,0.5)";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            return canv;
        },

        base: function (canv, m) {
            canv.fillStyle = "rgba(0,0,200,0.9)";
            canv.beginPath();
            canv.lineTo(m.r(m.w - 5), m.y - 5);
            canv.lineTo(m.r(m.w - 5), m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.y - 5);
            canv.fill();
            return canv;
        },

        hq: function (canv, m) {
            canv.fillStyle = "rgba(80,0,20,0.9)";
            canv.beginPath();
            canv.lineTo(m.r(m.w - 5), m.y - 5);
            canv.lineTo(m.r(m.w - 5), m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.u(m.h + 5));
            canv.lineTo(m.x - 5, m.y - 5);
            canv.fill();
            return canv;
        },

        // dimensions 
        plain: function (canv, m) {
            canv.fillStyle = "#d6f71b";
            //canv.strokeStyle = "black";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            canv.fill();
            //canv.stroke();
            canv.strokeStyle = "#f2ff00";
            canv.beginPath();
            for (var rand = 0; rand < width; rand += 1) {
                var randomHeight = m.random(m.y, m.u(m.h));
                var randomWidth = m.random(m.x, m.r(m.w));
                canv.moveTo(randomWidth, randomHeight);
                canv.lineTo(randomWidth + 4, randomHeight);
            }
            canv.stroke();
            //canv.strokeStyle = "black";
            canv.beginPath();
            canv.lineTo(m.r(m.w), m.y);
            canv.lineTo(m.r(m.w), m.u(m.h));
            canv.lineTo(m.x, m.u(m.h));
            canv.lineTo(m.x, m.y);
            //canv.stroke();
            return canv;
        },

        tallMountain: function (canv, m) {
            canv.strokeStyle = "#41471d";
            canv.fillStyle = "#ff8800";
            canv.beginPath();
            canv.moveTo(m.x, m.u(20));
            canv.lineTo(m.x, m.u(30));
            canv.lineTo(m.r(5), m.u(45));
            canv.quadraticCurveTo(m.r(15), m.u(50), m.r(15), m.u(50));
            canv.moveTo(m.r(10), m.u(35));
            canv.lineTo(m.r(20), m.u(67));
            canv.quadraticCurveTo(m.r(25), m.u(78), m.r(52), m.u(67));
            canv.lineTo(m.r(62), m.u(34));
            canv.quadraticCurveTo(m.r(68), m.u(20), m.r(38), m.y);
            canv.quadraticCurveTo(m.r(22), m.y, m.x, m.u(20));
            canv.fill();
            canv.stroke();
            return canv;
        },

        shortMountain: function (canv, m) {
            canv.strokeStyle = "#41471d";
            canv.fillStyle = "#ff8800";
            canv.beginPath();
            canv.moveTo(x, m.u(10));
            canv.lineTo(m.r(20), m.u(m.h));
            canv.lineTo(m.r(40), m.u(m.h));
            canv.lineTo(m.r(m.w), m.u(10));
            canv.quadraticCurveTo(m.r(31), m.d(9), m.r(5), m.u(10));
            canv.quadraticCurveTo(m.r(20));
            canv.fill();
            canv.stroke();
            return canv;
        },

        tree: function (canv, m) {
            canv.strokeStyle = "black";
            canv.fillStyle = "rgb(41,148,35)";
            canv.beginPath();
            //bottom
            canv.moveTo(m.r(21), m.u(15));
            canv.quadraticCurveTo(m.r(42), m.d(1), m.r(60), m.u(15));
            canv.quadraticCurveTo(m.r(74), m.u(25), m.r(59), m.u(33));
            canv.moveTo(m.r(21), m.u(15));
            canv.quadraticCurveTo(m.r(16), m.u(20), m.r(29), m.u(30));
            //middle
            canv.moveTo(m.r(27), m.u(30));
            canv.quadraticCurveTo(m.r(42), m.u(20), m.r(60), m.u(34));
            canv.quadraticCurveTo(m.r(58), m.u(34), m.r(50), m.u(43));
            //canv.quadraticCurveTo(m.r(58),m.u(38), m.r(50), m.u(43));
            canv.moveTo(m.r(27), m.u(30));
            canv.quadraticCurveTo(m.r(34), m.u(34), m.r(37), m.u(40));
            //top
            canv.moveTo(m.r(35), m.u(40));
            canv.quadraticCurveTo(m.r(44), m.u(35), m.r(51), m.u(41));
            canv.quadraticCurveTo(m.r(52), m.u(43), m.r(42), m.u(50));
            canv.moveTo(m.r(35), m.u(40));
            canv.quadraticCurveTo(m.r(40), m.u(42), m.r(42), m.u(50));
            canv.fill();
            canv.stroke();
            return canv;
        },

        infantry: function (canv, m) {
            canv.globalAlpha = transparent || 1;
            canv.fillStyle = "blue";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        },

        apc: function (canv, m) {
            canv.globalAlpha = transparent || 1;
            canv.fillStyle = "orange";
            canv.beginPath();
            canv.arc(m.r(32), m.u(32), 10, 0, 2 * Math.PI);
            canv.fill();
            return canv;
        }
    };
};