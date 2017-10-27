import {Dimensions} from "../../game/coordinates/dimensions";
import {DrawingTool} from "./lineTool";

export interface Animations {

  [animation: string]: (canvas?: any, line?: DrawingTool) => any;
}

export default function animations({width}: Dimensions): Animations {

  let transparent: number;

  const drawCircle = (canvas: any, circleSize: number, line: DrawingTool, color: string = "blue") => {

    canvas.globalAlpha = transparent || 1;
    canvas.fillStyle = color;
    canvas.beginPath();
    canvas.arc(line.moveRight(circleSize), line.moveUp(circleSize), 10, 0, 2 * Math.PI);
    canvas.fill();
  };

  return {

    hide(): void {
      transparent = 0.1;
    },
    cursor(canvas: any, line: DrawingTool): any {

      const sizeOfCursorCorners: number = 15;
      const distanceBetweenCorners: number = 64;
      const widthOfCorner: number = 3;
      const distanceToEdges: number = distanceBetweenCorners + widthOfCorner;
      const distanceFromEdgeToAdjacentCorner: number = distanceBetweenCorners - sizeOfCursorCorners;

      canvas.strokeStyle = "black";
      canvas.fillStyle = "#fff536";
      canvas.beginPath();

      // bottom left
      canvas.moveTo(line.moveLeft(widthOfCorner), line.moveUp(sizeOfCursorCorners));
      canvas.lineTo(line.moveLeft(widthOfCorner), line.moveDown(widthOfCorner));
      canvas.lineTo(line.moveRight(sizeOfCursorCorners), line.moveDown(widthOfCorner));
      canvas.lineTo(line.moveLeft(widthOfCorner), line.moveUp(sizeOfCursorCorners));

      // bottem right
      canvas.moveTo(line.moveRight(distanceToEdges), line.moveUp(sizeOfCursorCorners));
      canvas.lineTo(line.moveRight(distanceToEdges), line.moveDown(widthOfCorner));
      canvas.lineTo(line.moveRight(distanceFromEdgeToAdjacentCorner), line.moveDown(widthOfCorner));
      canvas.lineTo(line.moveRight(distanceToEdges), line.moveUp(sizeOfCursorCorners));

      // top right
      canvas.moveTo(line.moveRight(distanceToEdges), line.moveUp(distanceFromEdgeToAdjacentCorner));
      canvas.lineTo(line.moveRight(distanceToEdges), line.moveUp(distanceToEdges));
      canvas.lineTo(line.moveRight(distanceFromEdgeToAdjacentCorner), line.moveUp(distanceToEdges));
      canvas.lineTo(line.moveRight(distanceToEdges), line.moveUp(distanceFromEdgeToAdjacentCorner));

      // bottem left
      canvas.moveTo(line.moveLeft(widthOfCorner), line.moveUp(distanceFromEdgeToAdjacentCorner));
      canvas.lineTo(line.moveLeft(widthOfCorner), line.moveUp(distanceToEdges));
      canvas.lineTo(line.moveRight(sizeOfCursorCorners), line.moveUp(distanceToEdges));
      canvas.lineTo(line.moveLeft(widthOfCorner), line.moveUp(distanceFromEdgeToAdjacentCorner));

      canvas.fill();
      canvas.stroke();

      return canvas;
    },

    movementRange(canvas: any, line: DrawingTool): any {

      canvas.fillStyle = "rgba(255,255,255,0.3)";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width), line.y);
      canvas.lineTo(line.moveRight(line.width), line.moveUp(line.height));
      canvas.lineTo(line.x, line.moveUp(line.height));
      canvas.lineTo(line.x, line.y);
      canvas.fill();

      return canvas;
    },

    attackRange(canvas: any, line: DrawingTool): any {

      canvas.fillStyle = "rgba(240,5,0,0.4)";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width), line.y);
      canvas.lineTo(line.moveRight(line.width), line.moveUp(line.height));
      canvas.lineTo(line.x, line.moveUp(line.height));
      canvas.lineTo(line.x, line.y);
      canvas.fill();
      return canvas;
    },

    target(canvas: any, line: DrawingTool): any {

      canvas.fillStyle = "rgba(0,255,0,0.3)";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width), line.y);
      canvas.lineTo(line.moveRight(line.width), line.moveUp(line.height));
      canvas.lineTo(line.x, line.moveUp(line.height));
      canvas.lineTo(line.x, line.y);
      canvas.fill();
      return canvas;
    },

    pointer(canvas: any, line: DrawingTool): any {

      canvas.fillStyle = "rgba(255,143,30,0.3)";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width), line.y);
      canvas.lineTo(line.moveRight(line.width), line.moveUp(line.height));
      canvas.lineTo(line.x, line.moveUp(line.height));
      canvas.lineTo(line.x, line.y);
      canvas.fill();
      return canvas;
    },

    path(canvas: any, line: DrawingTool): any {

      canvas.fillStyle = "rgba(255,0,0,0.5)";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width), line.y);
      canvas.lineTo(line.moveRight(line.width), line.moveUp(line.height));
      canvas.lineTo(line.x, line.moveUp(line.height));
      canvas.lineTo(line.x, line.y);
      canvas.fill();
      return canvas;
    },

    base(canvas: any, line: DrawingTool): any {

      canvas.fillStyle = "rgba(0,0,200,0.9)";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width - 5), line.y - 5);
      canvas.lineTo(line.moveRight(line.width - 5), line.moveUp(line.height + 5));
      canvas.lineTo(line.x - 5, line.moveUp(line.height + 5));
      canvas.lineTo(line.x - 5, line.y - 5);
      canvas.fill();
      return canvas;
    },

    hq(canvas: any, line: DrawingTool): any {

      canvas.fillStyle = "rgba(80,0,20,0.9)";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width - 5), line.y - 5);
      canvas.lineTo(line.moveRight(line.width - 5), line.moveUp(line.height + 5));
      canvas.lineTo(line.x - 5, line.moveUp(line.height + 5));
      canvas.lineTo(line.x - 5, line.y - 5);
      canvas.fill();

      return canvas;
    },

    plain(canvas: any, line: DrawingTool): any {

      let randomHeight: number;
      let randomWidth: number;
      let rand: number;

      canvas.fillStyle = "#d6f71b";
      // canv.strokeStyle = "black";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width), line.y);
      canvas.lineTo(line.moveRight(line.width), line.moveUp(line.height));
      canvas.lineTo(line.x, line.moveUp(line.height));
      canvas.lineTo(line.x, line.y);
      canvas.fill();
      // canv.stroke();
      canvas.strokeStyle = "#f2ff00";

      canvas.beginPath();

      for (rand = 0; rand < width; rand += 1) {

        randomHeight = line.random(line.y, line.moveUp(line.height));
        randomWidth = line.random(line.x, line.moveRight(line.width));
        canvas.moveTo(randomWidth, randomHeight);
        canvas.lineTo(randomWidth + 4, randomHeight);
      }

      canvas.stroke();

      // canv.strokeStyle = "black";
      canvas.beginPath();
      canvas.lineTo(line.moveRight(line.width), line.y);
      canvas.lineTo(line.moveRight(line.width), line.moveUp(line.height));
      canvas.lineTo(line.x, line.moveUp(line.height));
      canvas.lineTo(line.x, line.y);
      // canv.stroke();

      return canvas;
    },

    tallMountain(canvas: any, line: DrawingTool): any {

      canvas.strokeStyle = "#41471d";
      canvas.fillStyle = "#ff8800";
      canvas.beginPath();

      canvas.moveTo(line.x, line.moveUp(20));
      canvas.lineTo(line.x, line.moveUp(30));
      canvas.lineTo(line.moveRight(5), line.moveUp(45));
      canvas.quadraticCurveTo(line.moveRight(15), line.moveUp(50), line.moveRight(15), line.moveUp(50));
      canvas.moveTo(line.moveRight(10), line.moveUp(35));
      canvas.lineTo(line.moveRight(20), line.moveUp(67));
      canvas.quadraticCurveTo(line.moveRight(25), line.moveUp(78), line.moveRight(52), line.moveUp(67));
      canvas.lineTo(line.moveRight(62), line.moveUp(34));
      canvas.quadraticCurveTo(line.moveRight(68), line.moveUp(20), line.moveRight(38), line.y);
      canvas.quadraticCurveTo(line.moveRight(22), line.y, line.x, line.moveUp(20));

      canvas.fill();
      canvas.stroke();

      return canvas;
    },

    shortMountain(canvas: any, line: DrawingTool): any {

      canvas.strokeStyle = "#41471d";
      canvas.fillStyle = "#ff8800";

      canvas.beginPath();
      canvas.moveTo(line.x, line.moveUp(10));
      canvas.lineTo(line.moveRight(20), line.moveUp(line.height));
      canvas.lineTo(line.moveRight(40), line.moveUp(line.height));
      canvas.lineTo(line.moveRight(line.width), line.moveUp(10));
      canvas.quadraticCurveTo(line.moveRight(31), line.moveDown(9), line.moveRight(5), line.moveUp(10));
      canvas.quadraticCurveTo(line.moveRight(20));

      canvas.fill();

      canvas.stroke();

      return canvas;
    },

    tree(canvas: any, line: DrawingTool): any {

      canvas.strokeStyle = "black";
      canvas.fillStyle = "rgb(41,148,35)";

      canvas.beginPath();

      // bottom
      canvas.moveTo(line.moveRight(21), line.moveUp(15));
      canvas.quadraticCurveTo(line.moveRight(42), line.moveDown(1), line.moveRight(60), line.moveUp(15));
      canvas.quadraticCurveTo(line.moveRight(74), line.moveUp(25), line.moveRight(59), line.moveUp(33));
      canvas.moveTo(line.moveRight(21), line.moveUp(15));
      canvas.quadraticCurveTo(line.moveRight(16), line.moveUp(20), line.moveRight(29), line.moveUp(30));

      // middle
      canvas.moveTo(line.moveRight(27), line.moveUp(30));
      canvas.quadraticCurveTo(line.moveRight(42), line.moveUp(20), line.moveRight(60), line.moveUp(34));
      canvas.quadraticCurveTo(line.moveRight(58), line.moveUp(34), line.moveRight(50), line.moveUp(43));
      // canvas.quadraticCurveTo(move.r(58),move.u(38), move.r(50), move.u(43));
      canvas.moveTo(line.moveRight(27), line.moveUp(30));
      canvas.quadraticCurveTo(line.moveRight(34), line.moveUp(34), line.moveRight(37), line.moveUp(40));

      // top
      canvas.moveTo(line.moveRight(35), line.moveUp(40));
      canvas.quadraticCurveTo(line.moveRight(44), line.moveUp(35), line.moveRight(51), line.moveUp(41));
      canvas.quadraticCurveTo(line.moveRight(52), line.moveUp(43), line.moveRight(42), line.moveUp(50));
      canvas.moveTo(line.moveRight(35), line.moveUp(40));
      canvas.quadraticCurveTo(line.moveRight(40), line.moveUp(42), line.moveRight(42), line.moveUp(50));

      canvas.fill();

      canvas.stroke();

      return canvas;
    },

    infantry(canvas: any, line: DrawingTool): any {

      const sizeOfCircle: number = 15;

      drawCircle(canvas, sizeOfCircle, line, "blue");

      return canvas;
    },

    apc(canvas: any, line: DrawingTool): any {

      const sizeOfCircle: number = 15;

      drawCircle(canvas, sizeOfCircle, line, "orange");

      return canvas;
    },
  };
}
